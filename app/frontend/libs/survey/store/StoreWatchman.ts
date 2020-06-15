import { Store } from 'redux'
import { getI18n } from 'libs/survey/core/preview/FlowProcessor/selectors'

let store: Store

export const I18n = () => getI18n(store.getState().preview)
export const getStore = () => store
export const setStore = (s: Store) => { store = s }
