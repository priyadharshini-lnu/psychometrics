import React from 'react'
import _ from 'lodash'

// WARN: sure you set className constant to component
const manageModal = Component => ({ current, ...rest }) => {
  if (!_.some(current, c => Component.className.includes(c))) return null
  return <Component {...rest} />
}

export default manageModal
