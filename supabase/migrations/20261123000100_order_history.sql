-- Existing orders/order_items remain editable carts. History is separate and immutable to visitors.
create table public.order_history (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 request_id uuid not null,
 created_at timestamptz not null default now(),
 status text not null default 'prepared' check(status='prepared'),
 name text not null check(char_length(name)<=80),
 notes text not null check(char_length(notes)<=500),
 total numeric(12,2) not null check(total>0),
 unique(owner_id,request_id)
);
create index order_history_owner_date on public.order_history(owner_id,created_at desc);
create table public.order_history_items (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.order_history(id) on delete cascade,
 product_id text not null, product_name text not null, size text not null,
 quantity integer not null check(quantity between 1 and 99),
 extra text not null, included text not null, temperature text not null, base text not null,
 unit_price numeric(10,2) not null check(unit_price>0),
 position integer not null,
 unique(order_id,position)
);
alter table public.order_history enable row level security;
alter table public.order_history_items enable row level security;
revoke all on public.order_history,public.order_history_items from anon,authenticated;
grant select on public.order_history,public.order_history_items to authenticated;
create policy own_history on public.order_history for select to authenticated
 using(owner_id=(select auth.uid()));
create policy own_history_items on public.order_history_items for select to authenticated
 using(exists(select 1 from public.order_history h where h.id=order_id and h.owner_id=(select auth.uid())));

-- Definer is narrowly scoped: identity from Auth, server prices, no client totals or ownership.
create function public.prepare_order(request_id uuid, customer_name text default '', customer_notes text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); oid uuid; hid uuid; snapshot jsonb; result jsonb;
begin
 if uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if request_id is null then raise exception 'Request identity required' using errcode='22023'; end if;
 -- Serialize preparation including retries even if the cart has already been emptied.
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 select h.id into hid from public.order_history h where h.owner_id=uid and h.request_id=prepare_order.request_id;
 if hid is null then
   select id into oid from public.orders where owner_id=uid for update;
   if oid is null then raise exception 'Empty cart' using errcode='22023'; end if;
   update public.orders set name=coalesce(customer_name,''),notes=coalesce(customer_notes,'') where id=oid;
   snapshot:=public.get_cart();
   if jsonb_array_length(snapshot->'items')=0 then raise exception 'Empty cart' using errcode='22023'; end if;
   insert into public.order_history(owner_id,request_id,name,notes,total)
    values(uid,prepare_order.request_id,snapshot->>'name',snapshot->>'notes',(snapshot->>'total')::numeric)
    returning id into hid;
   insert into public.order_history_items(order_id,product_id,product_name,size,quantity,extra,included,temperature,base,unit_price,position)
    select hid,i.product_id,p.name,i.size,i.quantity,i.extra,i.included,i.temperature,i.base,
     prices.price+case when i.extra<>'' then 5 else 0 end,
     row_number() over(order by i.created_at,i.id)::integer
    from public.order_items i join public.products p on p.id=i.product_id
    join public.product_prices prices on prices.product_id=i.product_id and prices.size=i.size
    where i.order_id=oid;
   update public.order_history set total=(select sum(quantity*unit_price) from public.order_history_items where order_id=hid) where id=hid;
   delete from public.order_items where order_id=oid;
   update public.orders set name='',notes='' where id=oid;
 end if;
 select to_jsonb(h) || jsonb_build_object('items',(
  select jsonb_agg(jsonb_build_object('id',i.product_id,'name',i.product_name,'size',i.size,'quantity',i.quantity,
   'extra',i.extra,'included',i.included,'temperature',i.temperature,'base',i.base,'unitPrice',i.unit_price) order by i.position)
  from public.order_history_items i where i.order_id=h.id)) into result
 from public.order_history h where h.id=hid and h.owner_id=uid;
 return jsonb_build_object('order',result,'cart',public.get_cart());
end $$;
revoke all on function public.prepare_order(uuid,text,text) from public,anon;
grant execute on function public.prepare_order(uuid,text,text) to authenticated;
