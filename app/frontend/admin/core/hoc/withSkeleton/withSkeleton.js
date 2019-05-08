import React from 'react'
import { Skeleton } from 'antd'
import cs from 'classnames'

const withSkeleton = WrapedComponent => (props) => {
  const { loading } = props

  return (
    <div>
      <div className={cs({ hidden: loading })}>
        <WrapedComponent {...props} />
      </div>
      {loading && <Skeleton active size="large" />}
    </div>
  )
}

export default withSkeleton
