const DEFAULT_PRIMARY_COLOR = '#061047'

// How far the seed is blended toward white for its light surface (selected menu item,
// profile banner, etc.) and the hovered variant. Consumed by seedTintAlgorithm so the derivation
// tracks whatever colorPrimary is active. Reproduces glint's Marsh tokens (#ebecf0 / #d7d9e2) for navy.
export const PRIMARY_BG_WHITE_RATIO = 0.92
export const PRIMARY_BG_HOVER_WHITE_RATIO = 0.86

export const constants = {
  DEFAULT_PRIMARY_COLOR,
  DARK_GREY: '#757575',
  GREY_BORDER: '#8F8F8F',
  DEFAULT_BORDER_RADIUS: 2,
  DEFAULT_BORDER_RADIUS_XS: 1,
  // antd's own default control heights, restated so buttons stay explicit and independent
  // of the global controlHeight token (which also drives inputs/selects).
  DEFAULT_BUTTON_HEIGHT: 32,
  DEFAULT_BUTTON_HEIGHT_SM: 24,
  DEFAULT_BUTTON_HEIGHT_LG: 40,
  // glint's Marsh buttons are flat; drop all button elevation. 'none' carries no color, so it stays seed-agnostic.
  DEFAULT_BUTTON_SHADOW: 'none',
  // Mirrors glint's BODY_FONT_STACK by value; the @font-face already ships in the vendors chunk.
  DEFAULT_FONT_FAMILY: "'Noto Sans', 'Noto Sans Fallback', system-ui, -apple-system, "
    + "BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
}
