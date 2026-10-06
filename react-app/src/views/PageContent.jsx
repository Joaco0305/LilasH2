import Hero from '../components/Hero.jsx'
import MenuCatalog from '../components/MenuCatalog.jsx'
import HowToOrder from '../components/HowToOrder.jsx'
import OurStory from '../components/OurStory.jsx'
import NotFound from './NotFound.jsx'
import { PRODUCTS, CATEGORIES } from '../data/menu.js'

export default function PageContent({ path, onSelectProduct }) {
  const menu = <MenuCatalog products={PRODUCTS} categories={CATEGORIES} onSelectProduct={onSelectProduct} />
  switch (path) {
    case '/': return <><Hero />{menu}<HowToOrder /><OurStory /></>
    case '/menu': return menu
    case '/historia': return <OurStory />
    case '/como-pedir': return <HowToOrder />
    default: return <NotFound />
  }
}
