export default interface EmbeddedData {
  [key: string]: EmbeddedDataValue[]
}

interface EmbeddedDataValue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
}
