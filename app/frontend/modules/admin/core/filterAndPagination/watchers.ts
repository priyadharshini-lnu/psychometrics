import { push, getLocation, getSearch } from 'connected-react-router'
import _ from 'lodash'
import { put, select, takeLatest } from 'redux-saga/effects'
import qs from 'qs'
import { getTableConfigs } from './selectors'
import { TableConfig } from './interfaces'

import {
  INIT_TABLE,
  CHANGE_FILTER,
  CHANGE_PAGE,
  REMOVE_FILTER,
  CHANGE_SORT,
  ActionsReturnType,
  setTableConfigFromUrl,
} from './actions'

function* genSetTableConfigFromUrl () {
  const queryString = yield select(getSearch)
  const tableConfigFromUlr = _.pick(parsedQueryString(queryString), ['filters', 'page', 'sort'])

  yield put(setTableConfigFromUrl(tableConfigFromUlr as TableConfig))
}

function* genSetUrlFromTableConfig ({ payload: { tableName } }: ActionsReturnType) {
  const { pathname } = yield select(getLocation)
  const tableConfig: TableConfig = yield select(state => getTableConfigs(tableName, state))
  const tableConfigForUlr = _.pick(tableConfig, ['filters', 'page', 'sort'])

  if (tableConfig.maintainHistory) {
    yield put(push(`${pathname}?${qs.stringify(tableConfigForUlr)}`))
  }
}

const parsedQueryString = (queryString: string): object => qs.parse(queryString.substring(1))

const watchers = [
  takeLatest([CHANGE_FILTER, CHANGE_PAGE, REMOVE_FILTER, CHANGE_SORT], genSetUrlFromTableConfig),
  takeLatest(INIT_TABLE, genSetTableConfigFromUrl),
]

export default watchers
