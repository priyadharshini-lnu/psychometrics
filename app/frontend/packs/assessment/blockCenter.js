import React from 'react'
import ReactDOM from 'react-dom'
import BlockCenter from 'survey-ui/src/containers/BlockCenterContainer'

const ID = window.blockCenterDomElementId || 'psychometrics_block_center'
ReactDOM.render(<BlockCenter />, document.getElementById(ID))
