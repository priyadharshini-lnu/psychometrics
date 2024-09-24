import { createSlice } from '@reduxjs/toolkit'
import _ from 'lodash'
import { denormalize } from 'normalizr'
import { getIn } from '~/utils/immutable'
import FlowElement from '~/modules/survey/models/FlowElement'
import Flow from '~/modules/survey/models/Flow'
import schema from '~/modules/survey/store/schema'

export const INIT = 'survey/assessment/INIT'

const loadElements = children => _.map(children, item => ({
  type: item.module.type,
  props: item.module.props || {},
  elements: loadElements(item.children),
}))

export const lookUpPath = (element) => {
  const path = _.flatten(element.path.map(i => ['elements', i]))
  path.pop()
  return path
}

export const getRealPath = (state, path) => {
  let p = ['elements']
  let strPath = ''
  return path.map((i) => {
    if (i === 'elements') { return i }
    strPath += `${i}`
    const index = _.findIndex(getIn(state, p), el => el.path.join('') === strPath)
    p = [...p, index, 'elements']
    return index
  })
}

export const defaultState = {
  elements: [],
}

const flow = createSlice({
  name: 'flow',
  initialState: defaultState,
  reducers: {
    reset (state, { payload: flow }) {
      state.elements = flow?.elements || []
    },
    updateElements (state, { payload }) {
      const flow = new Flow({ elements: loadElements(payload) })

      state.elements = flow.elements
    },
    addNewElement (state, { payload }) {
      const element = new FlowElement({}, payload.path, payload.elements.length)
      const path = lookUpPath(element)
      const { parent } = element

      if (parent.type === 'Randomizer' && parent.props.number + 1 === parent.elements.length) {
        parent.props.number += 1
        const path = lookUpPath(parent)
        _.set(state, [...path, 'props', 'number'], _.get(parent, ['props', 'number']) + 1)
      }

      const realPath = getRealPath(state, path)

      _.set(state, realPath, [..._.get(state, realPath), element])
      state.update = Date.now() // trick to update tree
    },

    addElementBelow (state, { payload: { element, index } }) {
      const path = _.take(element.path, element.path.length - 1)
      const newElement = new FlowElement({}, path.length && path, index + 1)
      const elpath = lookUpPath(element)

      _.set(state, elpath, [
        ..._.get(state, elpath).slice(0, index + 1),
        newElement,
        ..._.get(state, elpath).slice(index + 1),
      ])
      state.update = Date.now() // trick to update tree
    },
    updateElement (state, { payload: element }) {
      const path = lookUpPath(element)
      const index = _.findIndex(getIn(state, path), el => (_.isEqual(el.uuid, element.uuid)))
      if (index < 0) return
      _.set(state, [...path, index], element)
      state.update = Date.now()
    },

    removeElement (state, { payload: element }) {
      const path = lookUpPath(element)
      const index = _.findIndex(getIn(state, path), el => (el.path
        ? _.isEqual(el.uuid, element.uuid)
        : _.isEqual(el.path, element.path)))

      if (index < 0) return
      _.set(state, path, _.get(state, path).filter((el, i) => i !== index))
      state.update = Date.now() // trick to update tree
    },

    duplicateElement (state, { payload: element }) {
      const duplicate = new FlowElement(_.cloneDeep(element), element.parent)
      const path = lookUpPath(element)
      const index = _.findIndex(getIn(state, path), el => _.isEqual(el.uuid, element.uuid))
      _.set(state, path, [...getIn(state, path).slice(0, index + 1), duplicate, ...getIn(state, path).slice(index + 1)])
      state.update = Date.now() // trick to update tree
    },
  },
  extraReducers: (builder) => {
    builder.addCase(INIT, (state, { data }) => {
      const { flow } = denormalize(data.result, schema, data.entities)
      const elements = flow?.elements || []
      state.elements = _.map(elements, (el, i) => new FlowElement(el, null, i))
    })
  },
})

export const { actions } = flow

export default flow.reducer
