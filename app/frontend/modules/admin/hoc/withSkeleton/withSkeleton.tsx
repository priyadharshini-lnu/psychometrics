import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Skeleton } from 'antd'
import cs from 'classnames'
import { RootState } from '~/modules/admin/core/rootReducers'
import { isRequestInProgress } from '~/core/request'

export const connector = connect(
  (state: RootState) => ({ state }),
  {},
)

type PropsFromRedux = ConnectedProps<typeof connector>

const withSkeleton = (WrappedComponent: typeof React.Component, requestName: string) => (props: PropsFromRedux) => {
  const { state } = props
  const loading = isRequestInProgress(state, requestName)
  return (
    <div>
      <div className={cs({ hidden: loading })}>
        <WrappedComponent {...props} />
      </div>
      {loading && <Skeleton active />}
    </div>
  )
}

export default withSkeleton
