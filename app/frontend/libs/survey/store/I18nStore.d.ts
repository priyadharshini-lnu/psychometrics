declare module 'store/I18nStore' {
  const classes: {
    t: (name: string, data?: object) => string
  }
  export default classes
}
