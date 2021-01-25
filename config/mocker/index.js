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
  'GET /administration/new_campaigns/:parentId/datasheets': (_, res) => {
    const data = retrieveJSONFrom('./responses/campaignDatasheet/get.json')
    return res.json(data)
  },

  'GET /administration/new_campaigns/:parentId/datasheets/:userId': (
    _,
    res,
  ) => {
    const data = retrieveJSONFrom('./responses/campaignDatasheet/getOne.json')

    return res.json(data)
  },

  'POST /administration/new_campaigns/:parentId/datasheets': (_, res) => {
    const data = retrieveJSONFrom('./responses/campaignDatasheet/post.json')

    return res.json(data)
  },

  'PUT /administration/new_campaigns/:parentId/datasheets': (_, res) => {
    const data = retrieveJSONFrom('./responses/campaignDatasheet/put.json')

    return res.json(data)
  },

  'DELETE /administration/new_campaigns/:parentId/datasheets': (_, res) => {
    const data = retrieveJSONFrom('./responses/campaignDatasheet/delete.json')

    return res.json(data)
  },

  'GET /administration/projects/:parentId/datasheets': (_, res) => {
    const data = retrieveJSONFrom('./responses/projectDatasheet/get.json')

    return res.json(data)
  },

  'GET /administration/projects/:parentId/datasheets/:userId': (_, res) => {
    const data = retrieveJSONFrom('./responses/projectDatasheet/getOne.json')

    return res.json(data)
  },

  'POST /administration/projects/:parentId/datasheets': (_, res) => {
    const data = retrieveJSONFrom('./responses/projectDatasheet/post.json')

    return res.json(data)
  },

  'PUT /administration/projects/:parentId/datasheets': (_, res) => {
    const data = retrieveJSONFrom('./responses/projectDatasheet/put.json')

    return res.json(data)
  },

  'DELETE /administration/projects/:parentId/datasheets': (_, res) => {
    const data = retrieveJSONFrom('./responses/projectDatasheet/delete.json')

    return res.json(data)
  },
}

module.exports = delay(proxy, 3000)
