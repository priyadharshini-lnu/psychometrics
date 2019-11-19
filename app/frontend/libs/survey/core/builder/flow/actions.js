import { ADD_ELEMENT, DUPLICATE_ELEMENT } from './types'

export const addElement = element => ({ type: ADD_ELEMENT, element })
export const duplicateElement = element => ({ type: DUPLICATE_ELEMENT, element })
