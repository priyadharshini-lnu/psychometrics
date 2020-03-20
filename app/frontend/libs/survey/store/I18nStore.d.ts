declare module 'store/I18nStore' {
  const classes: {
    t: (name: string, data?: object) => string
    tQuestion: (question, field, extraData) => string
  }
  export default classes
}
