import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ErrorBoundary } from 'react-error-boundary'
import { Modules } from '~/modules/reports/components/modules'
import ModuleModel from '~/modules/reports/models/Module'
import { getModule } from '~/modules/reports/core/builder/selectors'

class Module extends Component {
  storeListener = null

  ref = null

  static propTypes = {
    page: PropTypes.object.isRequired,
    module: PropTypes.object.isRequired,
  }

  componentDidUpdate () {
    this.ref?.resetErrorBoundary()
  }

  render () {
    const {
      page, module, animation, flipContent,
    } = this.props
    if (!module.type) { return null }
    if (module.props.showOnAllPages) { return null }
    const model = new ModuleModel(module, page)
    const View = Modules[module.type]

    // NOTE: @fedor temporary kept update for connects
    return !model.removed && (
      <ErrorBoundary
        ref={(r) => { this.ref = r }}
        key={model.id}
        fallbackRender={() => (
          <Modules.Error module={model} page={page} update={{}} animation={animation} />
        )}
      >
        <View module={model} page={page} update={{}} animation={animation} flipContent={flipContent} />
      </ErrorBoundary>
    )
  }
}

export default connect(
  (state, props) => ({
    module: getModule(state.report, props.moduleId),
    flipContent: state.report.builder.flip_content,
  }),
  {},
)(Module)
