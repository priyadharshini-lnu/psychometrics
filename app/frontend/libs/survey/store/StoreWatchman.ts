import { Store } from 'redux'

let store: Store

export default {
  set (s: Store): void { store = s },
  get (): Store { return store },
}
