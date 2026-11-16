create table public.products (
  id text primary key, name text not null, category text not null, can_boba boolean not null
);
create table public.product_prices (
  product_id text references public.products(id) on delete restrict,
  size text check (size in ('P','M','G','EG','U')),
  price numeric(10,2) not null check (price > 0),
  primary key (product_id, size)
);
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique default auth.uid() references auth.users(id) on delete cascade,
  name text not null default '' check (char_length(name) <= 80),
  notes text not null default '' check (char_length(notes) <= 500),
  created_at timestamptz not null default now()
);
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null, size text not null,
  quantity integer not null check (quantity between 1 and 99),
  extra text not null default '', included text not null default '',
  temperature text not null default '', base text not null default '',
  created_at timestamptz not null default now(),
  foreign key (product_id, size) references public.product_prices(product_id,size) on delete restrict,
  unique (order_id,product_id,size,extra,included,temperature,base)
);

alter table public.products enable row level security;
alter table public.product_prices enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
revoke all on public.products, public.product_prices, public.orders, public.order_items from anon, authenticated;
grant select on public.products, public.product_prices to anon, authenticated;
grant select, insert, update, delete on public.orders, public.order_items to authenticated;
create policy catalog_read on public.products for select to anon, authenticated using (true);
create policy prices_read on public.product_prices for select to anon, authenticated using (true);
create policy own_order on public.orders for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy own_items on public.order_items for all to authenticated
  using (exists(select 1 from public.orders o where o.id = order_id and o.owner_id = (select auth.uid())))
  with check (exists(select 1 from public.orders o where o.id = order_id and o.owner_id = (select auth.uid())));

create function public.validate_cart_item() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare
  p public.products;
  flavors text[] := array['Tapioca','Frutilla','Maracuyá','Cherry','Manzana','Mora'];
begin
  select * into p from public.products where id = new.product_id;
  if not found then raise exception 'Invalid product' using errcode = '23514'; end if;
  if new.base <> '' or
    (new.extra <> '' and (not p.can_boba or not (new.extra = any(flavors)))) or
    (p.category = 'boba' and (not (new.included = any(flavors)) or new.temperature not in ('Frío','Caliente'))) or
    (p.category <> 'boba' and (new.included <> '' or new.temperature <> '')) then
    raise exception 'Invalid product options' using errcode = '23514';
  end if;
  return new;
end $$;
revoke all on function public.validate_cart_item() from public, anon, authenticated;
create trigger validate_item before insert or update on public.order_items
  for each row execute function public.validate_cart_item();

create function public.get_cart() returns jsonb
language sql stable security invoker set search_path = '' as $$
  select coalesce((select jsonb_build_object(
    'id', o.id, 'name', o.name, 'notes', o.notes,
    'items', coalesce((select jsonb_agg(jsonb_build_object(
      'lineId', i.id, 'id', i.product_id, 'size', i.size, 'quantity', i.quantity,
      'extra', i.extra, 'included', i.included, 'temperature', i.temperature, 'base', i.base,
      'unitPrice', p.price + case when i.extra <> '' then 5 else 0 end
    ) order by i.created_at,i.id) from public.order_items i join public.product_prices p
      on p.product_id=i.product_id and p.size=i.size where i.order_id=o.id), '[]'::jsonb),
    'total', coalesce((select sum(i.quantity * (p.price + case when i.extra <> '' then 5 else 0 end))
      from public.order_items i join public.product_prices p on p.product_id=i.product_id and p.size=i.size
      where i.order_id=o.id), 0)
  ) from public.orders o where o.owner_id=auth.uid()),
  '{"id":null,"name":"","notes":"","items":[],"total":0}'::jsonb);
$$;

-- Every mutation and its authoritative snapshot run in one transaction under RLS.
create function public.change_cart(action text, payload jsonb default '{}'::jsonb) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare oid uuid; affected integer; qty numeric;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if action not in ('add','quantity','remove','metadata') then
    raise exception 'Invalid action' using errcode='22023';
  end if;
  insert into public.orders(owner_id) values(auth.uid()) on conflict(owner_id) do nothing;
  select id into oid from public.orders where owner_id=auth.uid() for update;
  if action in ('add','quantity') then
    qty := (payload->>'quantity')::numeric;
    if qty is null or qty <> trunc(qty) or qty not between 1 and 99 then
      raise exception 'Invalid quantity' using errcode='23514';
    end if;
  end if;
  if action = 'add' then
    insert into public.order_items(order_id,product_id,size,quantity,extra,included,temperature,base)
    values(oid,payload->>'id',payload->>'size',qty::integer,
      coalesce(payload->>'extra',''),coalesce(payload->>'included',''),
      coalesce(payload->>'temperature',''),coalesce(payload->>'base',''))
    on conflict(order_id,product_id,size,extra,included,temperature,base)
    do update set quantity=public.order_items.quantity + excluded.quantity;
  elsif action = 'quantity' then
    update public.order_items set quantity=qty::integer where id=(payload->>'lineId')::uuid and order_id=oid;
    get diagnostics affected = row_count;
    if affected <> 1 then raise exception 'Item unavailable' using errcode='P0002'; end if;
  elsif action = 'remove' then
    delete from public.order_items where id=(payload->>'lineId')::uuid and order_id=oid;
    get diagnostics affected = row_count;
    if affected <> 1 then raise exception 'Item unavailable' using errcode='P0002'; end if;
  else
    update public.orders set name=coalesce(payload->>'name',''), notes=coalesce(payload->>'notes','') where id=oid;
  end if;
  return public.get_cart();
end $$;
revoke all on function public.get_cart(), public.change_cart(text,jsonb) from public, anon;
grant execute on function public.get_cart(), public.change_cart(text,jsonb) to authenticated;
