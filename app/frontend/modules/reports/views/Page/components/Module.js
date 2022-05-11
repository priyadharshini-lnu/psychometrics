import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modules } from 'modules/reports/components/modules'
import ModuleModel from 'modules/reports/models/Module'
import { connect } from 'react-redux'
import { getModule } from 'modules/reports/core/builder/selectors'

class Module extends Component {
  static propTypes = {
    page: PropTypes.object.isRequired,
    module: PropTypes.object.isRequired,
  }

  storeListener = null

  render () {
    const { page, module } = this.props
    if (!module.type) { return null }
    if (module.props.showOnAllPages) { return null }
    const model = new ModuleModel(module, page)
    const View = Modules[module.type]

    // NOTE: @fedor temporary kept update for connects
    return !model.removed && <View module={model} page={page} update={{}} />
  }
}

export default connect(
  (state, props) => ({
    module: getModule(state.report, props.moduleId),
  }),
  {},
)(Module)
