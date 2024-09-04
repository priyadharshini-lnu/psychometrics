import _ from 'lodash'
import { put, takeLatest } from 'redux-saga/effects'
import qs from 'qs'
import { TableConfig } from './interfaces'

import {
  INIT_TABLE,
  setTableConfigFromUrl,
} from './actions'

function* genSetTableConfigFromUrl () {
  const queryString = yield location.search
  const tableConfigFromUlr = _.pick(parsedQueryString(queryString), ['filters', 'page', 'sort'])

  yield put(setTableConfigFromUrl(tableConfigFromUlr as TableConfig))
}

const parsedQueryString = (queryString: string): object => qs.parse(queryString.substring(1))

const watchers = [
  takeLatest(INIT_TABLE, genSetTableConfigFromUrl),
]

export default watchers
