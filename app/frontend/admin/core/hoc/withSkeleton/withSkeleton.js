import React from 'react'
import { Skeleton } from 'antd'
import cs from 'classnames'

const withSkeleton = WrappedComponent => (props) => {
  const { loading } = props

  return (
    <div>
      <div className={cs({ hidden: loading })}>
        <WrappedComponent {...props} />
      </div>
      {loading && <Skeleton active size="large" />}
    </div>
  )
}

export default withSkeleton
