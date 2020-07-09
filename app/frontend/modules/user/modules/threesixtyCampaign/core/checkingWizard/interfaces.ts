export interface Config {
  network: {
    upload: number,
    download: number,
  },
  speedOfMeApiToken: string
}

export interface Checks {
  video: boolean
  audio: boolean
  network: boolean
}
