import React from 'react'
import { withRouter } from 'react-router-dom'
import routeUtils from 'utils/routeUtils'
import { Pagination as AntPagination } from 'antd'
import styles from './styles.scss'
import settings from '../../../settings.js'

function Pagination ({
  history, location, total, fetch, update, page, path,
}) {
  const onChange = (page) => {
    routeUtils.moveTo(history, settings.urlPrefix, `${path}?page=${page}`)
    update(page)
  }

  return (
    <div className={styles.container}>
      <AntPagination defaultCurrent={page} pageSize={settings.pageLimit} total={total} onChange={onChange} hideOnSinglePage />
    </div>
  )
}

export default withRouter(Pagination)
