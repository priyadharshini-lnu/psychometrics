export interface Config {
  network: {
    upload: number,
    download: number,
  },
  somapiToken: string
}

export interface Checks {
  video: boolean
  audio: boolean
  network: boolean
}
