import type { BinId } from './levels'

export interface Item {
  id: string
  name: string
  emoji: string
  bin: BinId
  tip: string
}

// To add an item, append a line to the matching group below. `id` must be unique.
export const ITEMS: Item[] = [
  // ♻️ Recycle
  { id: 'aluminum-can', name: 'Aluminum Can', emoji: '🥫', bin: 'recycle', tip: 'Aluminum can be recycled again and again without losing quality.' },
  { id: 'glass-jar', name: 'Glass Jar', emoji: '🍯', bin: 'recycle', tip: 'Rinse glass jars and they can be melted into new glass forever.' },
  { id: 'magazine', name: 'Magazine', emoji: '📖', bin: 'recycle', tip: 'Glossy paper is still paper, so magazines go with paper recycling.' },
  { id: 'cardboard-box', name: 'Cardboard Box', emoji: '📦', bin: 'recycle', tip: 'Flatten cardboard boxes to save space in the recycling bin.' },
  { id: 'plastic-bottle', name: 'Plastic Bottle', emoji: '🧴', bin: 'recycle', tip: 'Empty plastic bottles and put the cap back on before recycling.' },
  { id: 'newspaper', name: 'Newspaper', emoji: '📰', bin: 'recycle', tip: 'Clean, dry newspaper is easy to turn into new paper products.' },
  { id: 'soda-bottle', name: 'Soda Bottle', emoji: '🥤', bin: 'recycle', tip: 'PET soda bottles can become clothing fibers and new bottles.' },
  { id: 'tin-can', name: 'Tin Can', emoji: '🍅', bin: 'recycle', tip: 'Steel cans are magnetic and one of the most recycled items.' },
  { id: 'wine-bottle', name: 'Glass Bottle', emoji: '🍾', bin: 'recycle', tip: 'Glass bottles are 100% recyclable. Remove the cork or cap first.' },
  { id: 'cereal-box', name: 'Cereal Box', emoji: '🥣', bin: 'recycle', tip: 'Thin cardboard like cereal boxes is recyclable. Pull out the plastic liner.' },
  { id: 'paper-bag', name: 'Paper Bag', emoji: '🛍️', bin: 'recycle', tip: 'Paper bags can be recycled when they are clean and dry.' },
  { id: 'milk-jug', name: 'Milk Jug', emoji: '🥛', bin: 'recycle', tip: 'HDPE milk jugs are widely recycled. Give them a quick rinse.' },
  { id: 'office-paper', name: 'Office Paper', emoji: '📄', bin: 'recycle', tip: 'Office paper is high-quality fiber and very valuable to recyclers.' },
  { id: 'shampoo-bottle', name: 'Shampoo Bottle', emoji: '🧼', bin: 'recycle', tip: 'Empty bathroom bottles are recyclable too, not just kitchen ones.' },
  { id: 'egg-carton', name: 'Paper Egg Carton', emoji: '🥚', bin: 'recycle', tip: 'Cardboard egg cartons are recyclable (foam ones are not).' },

  // 🗑️ Trash
  { id: 'chip-bag', name: 'Chip Bag', emoji: '🍟', bin: 'trash', tip: 'Foil-lined snack bags are mixed materials and cannot be recycled.' },
  { id: 'styrofoam-cup', name: 'Styrofoam Cup', emoji: '☕', bin: 'trash', tip: 'Polystyrene foam is rarely accepted for recycling.' },
  { id: 'used-tissue', name: 'Used Tissue', emoji: '🤧', bin: 'trash', tip: 'Used tissues are too contaminated for recycling.' },
  { id: 'broken-mug', name: 'Broken Ceramic Mug', emoji: '🏺', bin: 'trash', tip: 'Ceramics melt at a different temperature than glass and ruin batches.' },
  { id: 'candy-wrapper', name: 'Candy Wrapper', emoji: '🍬', bin: 'trash', tip: 'Tiny mixed-material wrappers slip through recycling machines.' },
  { id: 'diaper', name: 'Diaper', emoji: '🧷', bin: 'trash', tip: 'Diapers are soiled and made of mixed materials, so they go in the trash.' },
  { id: 'cigarette-butt', name: 'Cigarette Butt', emoji: '🚬', bin: 'trash', tip: 'Filters are plastic and full of toxins. Always bin them.' },
  { id: 'greasy-pizza-box', name: 'Greasy Pizza Box', emoji: '🍕', bin: 'trash', tip: 'Grease soaks into cardboard fibers and spoils the recycling batch.' },
  { id: 'plastic-straw', name: 'Plastic Straw', emoji: '🥢', bin: 'trash', tip: 'Straws are too small and light to be sorted by recycling machines.' },
  { id: 'old-sponge', name: 'Old Sponge', emoji: '🧽', bin: 'trash', tip: 'Kitchen sponges are made of synthetic foam and are not recyclable.' },
  { id: 'sticky-tape', name: 'Sticky Tape', emoji: '📎', bin: 'trash', tip: 'Adhesive tape is a mixed material that contaminates paper recycling.' },
  { id: 'vacuum-dust', name: 'Vacuum Dust', emoji: '🌫️', bin: 'trash', tip: 'Dust and dirt have no recycling value. Into the trash it goes.' },

  // 🌱 Compost
  { id: 'banana-peel', name: 'Banana Peel', emoji: '🍌', bin: 'compost', tip: 'Banana peels break down quickly and return potassium to the soil.' },
  { id: 'apple-core', name: 'Apple Core', emoji: '🍎', bin: 'compost', tip: 'Fruit scraps are perfect compost material.' },
  { id: 'coffee-grounds', name: 'Coffee Grounds', emoji: '☕', bin: 'compost', tip: 'Coffee grounds are rich in nitrogen, which compost loves.' },
  { id: 'eggshells', name: 'Eggshells', emoji: '🥚', bin: 'compost', tip: 'Crushed eggshells add calcium to compost.' },
  { id: 'lettuce-leaves', name: 'Lettuce Leaves', emoji: '🥬', bin: 'compost', tip: 'Leafy greens decompose fast and feed the compost pile.' },
  { id: 'tea-bag', name: 'Tea Bag', emoji: '🍵', bin: 'compost', tip: 'Most paper tea bags and the leaves inside are compostable.' },
  { id: 'orange-peel', name: 'Orange Peel', emoji: '🍊', bin: 'compost', tip: 'Citrus peels compost well in moderation.' },
  { id: 'grass-clippings', name: 'Grass Clippings', emoji: '🌿', bin: 'compost', tip: 'Fresh grass clippings are a "green" compost ingredient.' },
  { id: 'fallen-leaves', name: 'Fallen Leaves', emoji: '🍂', bin: 'compost', tip: 'Dry leaves are the "brown" carbon that balances compost.' },
  { id: 'bread-crust', name: 'Bread Crust', emoji: '🍞', bin: 'compost', tip: 'Plain bread scraps break down easily in a compost bin.' },
  { id: 'corn-cob', name: 'Corn Cob', emoji: '🌽', bin: 'compost', tip: 'Corn cobs are slow but they do break down into good soil.' },
  { id: 'watermelon-rind', name: 'Watermelon Rind', emoji: '🍉', bin: 'compost', tip: 'Watery fruit rinds compost quickly and add moisture.' },

  // 🔌 E-waste
  { id: 'old-phone', name: 'Old Phone', emoji: '📱', bin: 'ewaste', tip: 'Phones contain gold, copper and rare metals that can be recovered.' },
  { id: 'battery', name: 'Battery', emoji: '🔋', bin: 'ewaste', tip: 'Batteries can leak toxic chemicals or start fires in the trash.' },
  { id: 'charger-cable', name: 'Charger Cable', emoji: '🔌', bin: 'ewaste', tip: 'Cables hold recoverable copper and should go to e-waste collection.' },
  { id: 'light-bulb', name: 'Light Bulb', emoji: '💡', bin: 'ewaste', tip: 'CFL and LED bulbs contain electronics, and CFLs hold a little mercury.' },
  { id: 'headphones', name: 'Headphones', emoji: '🎧', bin: 'ewaste', tip: 'Headphones are small electronics with magnets and wires to recover.' },
  { id: 'keyboard', name: 'Computer Keyboard', emoji: '⌨️', bin: 'ewaste', tip: 'Old keyboards have circuit boards and belong with e-waste.' },
  { id: 'laptop', name: 'Broken Laptop', emoji: '💻', bin: 'ewaste', tip: 'Laptops have valuable metals plus a battery that must be handled safely.' },
  { id: 'remote', name: 'TV Remote', emoji: '📺', bin: 'ewaste', tip: 'Remotes are electronics. Take the batteries out and recycle both.' },
  { id: 'camera', name: 'Digital Camera', emoji: '📷', bin: 'ewaste', tip: 'Old cameras contain circuit boards and lithium batteries.' },
  { id: 'computer-mouse', name: 'Computer Mouse', emoji: '🖱️', bin: 'ewaste', tip: 'Anything with a circuit board belongs in e-waste, even small gadgets.' },
]
