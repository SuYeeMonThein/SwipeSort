import type { BinId } from './levels'

export interface MonsterMeta {
  bin: BinId
  name: string
  tagline: string
  color: string
  shade: string
  /** Shown in the speech bubble on a correct sort (the "+N" is appended). */
  cheer: string
}

export const MONSTERS: Record<BinId, MonsterMeta> = {
  recycle: { bin: 'recycle', name: 'Remy', tagline: 'Round robot-monster. Happy and bouncy!', color: '#3DDC84', shade: '#1FA85C', cheer: 'Crunchy!' },
  trash: { bin: 'trash', name: 'Grumbo', tagline: 'Grumpy grey bin. Lid for a hat.', color: '#6B7280', shade: '#4B5260', cheer: 'Hmph. Fine.' },
  compost: { bin: 'compost', name: 'Sprout', tagline: 'Sleepy soil blob with a leaf.', color: '#B5651D', shade: '#86480F', cheer: 'Mmm, yum!' },
  ewaste: { bin: 'ewaste', name: 'Volt', tagline: 'Spiky, twitchy and electric!', color: '#9B5CFF', shade: '#6F36CC', cheer: 'Zzzap!' },
}
