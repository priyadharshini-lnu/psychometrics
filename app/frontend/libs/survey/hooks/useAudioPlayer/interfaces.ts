export interface AudioPlayerSkin {
  render: (el: HTMLElement) => void
}

export interface AudioPlayerSkins {
  [skin: string]: AudioPlayerSkin
}
