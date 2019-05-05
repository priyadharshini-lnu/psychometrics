import React from 'react'
import { Skeleton } from 'antd'
import classnames from 'classnames'

const withSkeleton = WrapedComponent => (props) => {
  const { loading } = props

  return (
    <div>
      <div className={classnames({ hidden: loading })}>
        <WrapedComponent {...props} />
      </div>
      {loading ? <Skeleton active size="large" /> : null}
    </div>
  )
}

export default withSkeleton
