/* eslint-disable @typescript-eslint/no-explicit-any */

declare class Page {
  constructor(args)

  id: number

  name: string

  modules: []

  removed: boolean

  toJSON(): {}
}

export = Page
