import React from 'react'
import cs from 'classnames'
import { Icon } from 'antd'
import { Link as RouterLink, withRouter } from 'react-router-dom'
import queryString from 'query-string'
import routeUtils from 'utils/routeUtils'
import styles from './styles.scss'
import settings from '../../../settings.js'

function Link ({
  to, className, enable, children,
}) {
  const Container = enable ? RouterLink : 'div'
  return (
    <Container to={to} className={cs(className, { [styles.disabled]: !enable })}>
      {children}
    </Container>
  )
}

const getPath = (location, params) => `${location.pathname}?${queryString.stringify(params)}`

function Pagination ({ location, total, fetch }) {
  const oldParams = queryString.parse(location.search)
  const currentPage = routeUtils.getCurrentPage()
  const next = { ...oldParams, page: currentPage + 1 }
  const prev = { ...oldParams, page: currentPage - 1 }

  const clickNext = () => fetch((next.page - 1) * settings.pageLimit)
  const clickPrev = () => fetch((prev.page - 1) * settings.pageLimit)

  const newerIsEnabled = prev.page > 0
  const olderIsEnabled = total > settings.pageLimit * currentPage
  return (
    <div className={styles.container}>
      <Link to={getPath(location, prev)} enable={newerIsEnabled}>
        <div onClick={() => newerIsEnabled ? clickPrev() : null} className={styles.link}>
          <Icon className="mrs" type="arrow-left" />
          <span className="align-middle">Newer</span>
        </div>
      </Link>
      <Link to={getPath(location, next)} enable={olderIsEnabled}>
        <div onClick={() => olderIsEnabled ? clickNext() : null} className={styles.link}>
          <span className="align-middle mrs">Older</span>
          <Icon type="arrow-right" />
        </div>
      </Link>
    </div>
  )
}

export default withRouter(Pagination)
