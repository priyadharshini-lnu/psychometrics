// Needs to be removed when @types/react is upgraded to >=v17.0.56

export { }
declare global {
  namespace React {
    interface HTMLAttributes {
      rev?: string
    }
  }
}
