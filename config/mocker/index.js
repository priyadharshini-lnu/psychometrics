const fs = require('fs')
const path = require('path')
const delay = require('mocker-api/lib/delay')

function retrieveJSONFrom (jsonPath) {
  const dataPath = path.resolve(__dirname, jsonPath)

  const rawData = fs.readFileSync(dataPath)
  const data = JSON.parse(rawData)

  return data
}

const proxy = {
  // 'GET /relative/url': (_, res) => {
  //   const data = retrieveJSONFrom('./responses/path/to/response.json')
  //   return res.json(data)
  // },
}

module.exports = delay(proxy, 3000)
