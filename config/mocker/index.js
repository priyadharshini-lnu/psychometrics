const fs = require('fs')
const path = require('path')
const delay = require('mocker-api/lib/delay')

function retrieveJSONFrom (jsonPath) {
  const dataPath = path.resolve(__dirname, jsonPath)

  const rawData = fs.readFileSync(dataPath)
  const data = JSON.parse(rawData)

  return data
}

let ParticipantData = retrieveJSONFrom('./responses/projectParticipants/participantsData.json')

const proxy = {
  // Comment this instead of deleting. Useful for syntax lookups
  // 'GET /relative/url': (_, res) => {
  //   const data = retrieveJSONFrom('./responses/path/to/response.json')
  //   return res.json(data)
  // },

  'GET /administration/projects/:projectId/assesssors': (_, res) => {
    const data = retrieveJSONFrom('./responses/projectAssessors/get.json')
    return res.json(data)
  },

  'GET /administration/projects/:projectId/assesssors/:assessorId': (_, res) => {
    const data = retrieveJSONFrom('./responses/projectAssessors/getOne.json')
    return res.json(data)
  },

  'PUT /administration/projects/:projectId/assesssors/:assessorId': (_, res) => {
    const data = retrieveJSONFrom('./responses/projectAssessors/put.json')
    return res.json(data)
  },

  'GET /administration/projects/:projectId/assesssors/:assessorId/reset_password': (_, res) => res.json('ok'),

  'DELETE /administration/projects/:projectId/assesssors/:assessorId': (_, res) => {
    const data = retrieveJSONFrom('./responses/projectAssessors/delete.json')
    return res.json(data)
  },

  /* Project Participants API mocks */
  'GET /administration/projects/:projectId/participants': (_, res) => res.json(ParticipantData),

  'GET /administration/projects/:projectId/participants/:participantId': (req, res) => {
    const resObj = ParticipantData.list.find(participant => participant.id === parseInt(req.params.participantId, 10))
    return res.json(resObj)
  },

  'PUT /administration/projects/:projectId/participants/:participantId': (req, res) => {
    const { first_name, last_name, email } = req.body.resource
    const updatedParticipantList = ParticipantData.list.map((participant) => {
      if (participant.id === parseInt(req.params.participantId, 10)) {
        return {
          ...participant, firstName: first_name, lastName: last_name, email,
        }
      }
      return participant
    })
    const updatedParticipantData = { total: updatedParticipantList.length, list: updatedParticipantList }
    ParticipantData = updatedParticipantData
    const resObj = ParticipantData.list.find(participant => participant.id === parseInt(req.params.participantId, 10))

    return res.json(resObj)
  },

  'DELETE /administration/projects/:projectId/participants/:participantId': (req, res) => {
    const updatedParticipantList = ParticipantData.list.filter(
      participant => participant.id !== parseInt(req.params.participantId, 10),
    )
    const updatedParticipantData = { total: updatedParticipantList.length, list: updatedParticipantList }
    ParticipantData = updatedParticipantData

    const resObj = { id: parseInt(req.params.participantId, 10) }

    return res.json(resObj)
  },
  'GET /administration/projects/:projectId/participants/:participantId/reset_password': (_, res) => res.json('ok'),
}

module.exports = delay(proxy, 3000)
