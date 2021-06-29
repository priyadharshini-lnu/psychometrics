declare class LibraryStore {
  static openPopup(
    socket: SocketTransport | undefined | null,
    onSelect: (item: { file: string }) => void,
    type?: string
  ): void
}

interface SocketTransport {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  perform(action: any, data: any, onResponce: any): void
  init(): void
}

export { LibraryStore }
