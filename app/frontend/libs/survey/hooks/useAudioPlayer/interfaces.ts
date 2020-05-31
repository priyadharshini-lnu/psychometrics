export interface AudioPlayerSkin {
  render: (el: HTMLElement) => void
  cleanup?: () => void
}

export interface AudioPlayerSkins {
  [skin: string]: AudioPlayerSkin
}
