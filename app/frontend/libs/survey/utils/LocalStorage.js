const LocalStorage = {

  getIn (keys) {
    try {
      const data = JSON.parse(localStorage.getItem(keys.join('/')))
      if (data === null || data.expiresAt <= new Date().getTime()) {
        return null
      }
      return data.value
      // eslint-disable-next-line no-console
    } catch (e) { console.warn(e) }
    return null
  },

  setIn (keys, value, expiry = 3600) {
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + expiry)
    localStorage.setItem(keys.join('/'), JSON.stringify({ value, expiresAt: expiresAt.getTime() }))
  },

  remove (keys) {
    localStorage.removeItem(keys.join('/'))
  },
}

export default LocalStorage
