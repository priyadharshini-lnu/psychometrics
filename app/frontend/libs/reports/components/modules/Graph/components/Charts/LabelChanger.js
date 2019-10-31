/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import _ from 'lodash'
import AssessmentStore from 'rb/store/AssessmentStore'
import PromptStore from 'rb/store/PromptStore'
import Utils from 'rb/utils/Utils'

export const DefaultBehaviour = (model, label, question, collectionName) => {
  const val = label
  let index = -1
  const collection = model.props[collectionName]
  for (const i in collection) {
    const text = collection[i]
    if (text === val) {
      index = i
      break
    }
  }

  let current
  if (index > -1) {
    current = collection[index]
  } else {
    index = _.indexOf(question.props.choicesTexts, val)
    current = question.props.choicesTexts[index]
  }
  PromptStore.open(current, (value) => {
    collection[index] = value
    model.update()
    this.forceUpdate()
  })
}

export const HotSpotBehaviour = (model, label, question, collectionName) => {
  const val = label
  // TODO: remove this hack
  const collection = model.props[collectionName]
  const regionId = parseInt(val.split(' ')[1], 10)
  let index = regionId
  if (!regionId && regionId !== 0) {
    index = parseInt(Utils.findKeyWhere(collection, val), 10)
  }
  if (_.isNaN(index) || index < 0) {
    return
  }
  const current = val
  PromptStore.open(current, (value) => {
    collection[index] = value
    model.update()
    this.forceUpdate()
  })
}

export const changeLabel = (model, label, collectionName = 'choicesTexts') => {
  const assessmentId = model.assessment_id
  const question = AssessmentStore.questions[assessmentId][model.props.source.id]
  switch (question.type) {
    case 'HotSpot':
      HotSpotBehaviour(label, question, collectionName)
      break
    default:
      DefaultBehaviour(label, question, collectionName)
  }
}
