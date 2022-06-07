import React from 'react'
import { withRouter } from 'react-router-dom'
import routeUtils from 'utils/route'
import { Pagination as AntPagination } from 'antd'
import styles from './styles.less'
import settings from '../../settings'

function Pagination ({
  history, total, path, onChange,
}) {
  const handleOnChange = (page) => {
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
        showSizeChanger={false}
        hideOnSinglePage
      />
    </div>
  )
}

export default withRouter(Pagination)
