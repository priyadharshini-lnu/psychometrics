export default {
  run: (user: {datasheet: {}}) => {
    if (!user) { return {} }

    return user.datasheet || {}
  },
}
