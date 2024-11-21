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
let NormsData = retrieveJSONFrom('./responses/norm/index.json')

const proxy = {
  'GET /invites.json': (_, res) => {
    const data = retrieveJSONFrom('./responses/invites/index.json')
    return res.json(data)
  },

  'GET /bookings.json': (_, res) => {
    const data = retrieveJSONFrom('./responses/bookings/index.json')
    return res.json(data)
  },

  'GET /api/v2/administration/clients': (_, res) => {
    const data = retrieveJSONFrom('./responses/client/index.json')
    return res.json(data)
  },

  'GET /campaigns/10146.json': (_, res) => {
    const data = retrieveJSONFrom('./responses/campaign/campaign_with_booking.json')
    // const data = retrieveJSONFrom('./responses/campaign/campaign_with_invite.json')
    return res.json(data)
  },

  // Below code can be used as inspiration to mock CRUD endpoints
  // Project Participants API mocks
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

  'GET /api/v2/administration/norms': (_, res) => res.json(NormsData),

  'GET /api/v2/administration/norms/:normId': (req, res) => {
    const resObj = NormsData.list.find(norm => norm.id === parseInt(req.params.normId, 10))
    return res.json(resObj)
  },

  'PUT /api/v2/administration/norms/:normId': (req, res) => {
    const { assessmentId, normalizeNormScores } = req.body.resource
    const updatedNormList = NormsData.list.map((norm) => {
      if (norm.id === parseInt(req.params.normId, 10)) {
        return {
          ...norm, assessmentId, normalizeNormScores,
        }
      }
      return norm
    })
    const updatedNormData = { total: updatedNormList.length, list: updatedNormList }
    NormsData = updatedNormData
    const resObj = NormsData.list.find(norm => norm.id === parseInt(req.params.normId, 10))

    return res.json(resObj)
  },

  'DELETE /api/v2/administration/norms/:normId': (req, res) => {
    const updatedNormList = NormsData.data.filter(
      norm => norm.id !== parseInt(req.params.normId, 10),
    )
    const updatedNormData = { data: updatedNormList }
    NormsData = updatedNormData

    const resObj = { id: parseInt(req.params.normId, 10) }

    return res.json(resObj)
  },
}

module.exports = delay(proxy, 3000)
