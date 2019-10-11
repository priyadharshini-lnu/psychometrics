import React from 'react'
import { withRouter } from 'react-router-dom'
import routeUtils from 'utils/routeUtils'
import { Pagination as AntPagination } from 'antd'
import styles from './styles.scss'
import settings from '../../../settings.js'

function Pagination ({
  history, total, path, onChange
}) {
  const handleOnChange = page => {
    onChange && onChange(page)
    routeUtils.moveTo(history, settings.urlPrefix, `${path}?page=${page}`)
  }

  return (
    <div className={styles.container}>
      <AntPagination
        current={routeUtils.getPage()}
        pageSize={settings.pageLimit}
        total={total}
        onChange={handleOnChange}
        hideOnSinglePage
      />
    </div>
  )
}

export default withRouter(Pagination)
