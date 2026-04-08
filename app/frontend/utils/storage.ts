import _ from 'lodash'
import CryptoJS from 'crypto-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setItem = (key: string, value: any, token: string, expireTime = Infinity): void => {
  const expire = Date.now() + expireTime
  const data = { expire, value: CryptoJS.AES.encrypt(JSON.stringify(value), token).toString() }
  localStorage.setItem(key, JSON.stringify(data))
}

export const getItem = (key: string, token: string): object | null => {
  removeExpiredData()
  const json = localStorage.getItem(key)
  if (!json) { return null }

  const data = JSON.parse(json)
  try {
    const bytes = CryptoJS.AES.decrypt(data.value, token)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    return JSON.parse(decrypted)
  } catch (e) {
    console.warn(e)
  }
  return null
}

const removeExpiredData = (): void => {
  _.each(_.keys(localStorage), (key) => {
    if (key.match(/result_/)) {
      const json = localStorage.getItem(key)
      if (json) {
        const data = JSON.parse(json)

        if (data.expire && data.expire < Date.now()) {
          localStorage.removeItem(key)
        }
      }
    }
  })
}
