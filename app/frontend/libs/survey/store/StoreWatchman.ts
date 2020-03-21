import { Store } from 'redux'
import { getI18n } from 'libs/survey/core/preview/FlowProcessor/selectors'
import { I18nInterface } from 'libs/survey/core/preview/FlowProcessor/interfaces'

let store: Store

export default {
  set (s: Store): void { store = s },
  get (): Store { return store },
  I18n (): I18nInterface {
    return getI18n(store.getState().preview)
  },
}
