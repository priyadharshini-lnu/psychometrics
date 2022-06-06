import 'styles/core.less'
import React from 'react'
import ReactDOM from 'react-dom'
import * as backendComponents from './components/backend'

window.React = React
window.ReactDOM = ReactDOM
window.PsyComponents = window.PsyComponents || backendComponents
