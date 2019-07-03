import React from 'react'

const manageModal = Component => ({ current, ...rest }) => {
  if (!Component.name.includes(current)) return null
  return <Component {...rest} />
}

export default manageModal
