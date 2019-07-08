import React from 'react'
import _ from 'lodash'

const manageModal = Component => ({ current, ...rest }) => {
  if (!_.some(current, c => Component.name.includes(c))) return null
  return <Component {...rest} />
}

export default manageModal
