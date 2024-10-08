export interface Config {
  network: {
    upload: number,
    download: number,
  }
}

export interface Checks {
  video: boolean
  audio: boolean
  network: boolean
}
