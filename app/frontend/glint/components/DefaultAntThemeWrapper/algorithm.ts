import { theme } from 'antd'
import type { MappingAlgorithm } from 'antd'
import { tintTowardWhite } from '~/utils/color'
import { PRIMARY_BG_WHITE_RATIO, PRIMARY_BG_HOVER_WHITE_RATIO } from './constants'

const { defaultAlgorithm } = theme

// Custom antd derivation: run the default algorithm, then re-derive the light primary surfaces
// (selected menu item, profile banner, etc.) as hue-preserving tints of whatever seed is active.
// antd's stock light shades desaturate dark seeds like the Marsh navy into gray; deriving them
// here keeps every colorPrimary on-brand, and components that reference colorPrimaryBg
// (e.g. Menu.itemSelectedBg) pick it up automatically.
export const seedTintAlgorithm: MappingAlgorithm = (seed) => {
  const base = defaultAlgorithm(seed)
  return {
    ...base,
    colorPrimaryBg: tintTowardWhite(base.colorPrimary, PRIMARY_BG_WHITE_RATIO),
    colorPrimaryBgHover: tintTowardWhite(base.colorPrimary, PRIMARY_BG_HOVER_WHITE_RATIO),
  }
}
