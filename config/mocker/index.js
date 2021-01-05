const fs = require('fs')
const path = require('path')
const delay = require('mocker-api/lib/delay')

const proxy = {
  'GET /administration/new_campaigns/:parentId/datasheets': (_, res) => {
    const dataPath = path.resolve(
      __dirname,
      './responses/campaignDatasheet/get.json',
    )
    const rawData = fs.readFileSync(dataPath)
    const data = JSON.parse(rawData)

    return res.json(data)
  },

  'GET /administration/projects/:parentId/datasheets': (_, res) => {
    const dataPath = path.resolve(
      __dirname,
      './responses/projectDatasheet/get.json',
    )
    const rawData = fs.readFileSync(dataPath)
    const data = JSON.parse(rawData)

    return res.json(data)
  },
}

module.exports = delay(proxy, 1000)
