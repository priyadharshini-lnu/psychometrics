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
}

module.exports = delay(proxy, 3000)
