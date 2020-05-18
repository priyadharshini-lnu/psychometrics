import React from 'react'
import withCopyProtection from 'components/hocs/withCopyProtection'
import StaticContent from './StaticContent'
import connect from './connect'

const ConnectedStaticContent = connect(StaticContent)

export default withCopyProtection(React.forwardRef((props, ref) => (
  <ConnectedStaticContent {...props} forwardRef={ref} />
)))
