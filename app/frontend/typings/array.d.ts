export { }

declare global {
  interface Array<T> {
    concat<U>(...items: (U | ConcatArray<U>)[]): (T | U)[]
  }
}
