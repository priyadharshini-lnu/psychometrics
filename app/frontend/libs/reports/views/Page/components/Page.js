import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modules } from 'rb/components/modules'
import panelStore from 'rb/store/PropertyPanelStore'
import ModuleModel from 'rb/models/Module'
import RichEditorStore from 'rb/store/RichEditorStore'
import styles from './Page.scss'
import Header from './PageHeader'
import Footer from './PageFooter'
import DisplayLogic from './DisplayLogic/DisplayLogic'

class Page extends Component {
  storeListener = null

  static propTypes = {
    model: PropTypes.object.isRequired,
    last: PropTypes.bool,
    renderModules: PropTypes.bool,
  }

  componentDidMount () {
    const { model: { modules } } = this.props
    this.storeListener = modules.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.storeListener.remove()
  }

  renderModuleType = (module, i) => {
    const { model: page } = this.props
    if (!module.type) { return false }
    const model = new ModuleModel(module, page)
    const View = Modules[module.type]
    return !model.removed && <View key={i} module={model} page={page} />
  }

  renderShadowModule = (module, i) => {
    const { model: page } = this.props
    const model = new ModuleModel(module, page)
    const View = Modules[model.type]
    return <View key={i} module={model} page={page} shadow />
  }

  selectPage = (e) => {
    const { model, unselectModules } = this.props
    e.stopPropagation()
    unselectModules()
    RichEditorStore.close()
    panelStore.select('Page', model)
  }

  render () {
    const {
      report: { builder }, modules, model = {}, renderModules, showOnAllPages,
    } = this.props
    const selected = panelStore.model === model

    const style = {
      ...builder.props.sizes,
    }
    return (
      <div className={styles.page} name={model.id} onClick={this.selectPage}>
        <div
          className={`${styles.pageContainer} ${selected ? styles.selected : ''}`}
          style={{ width: builder.props.sizes.width }}
        >
          <Header {...this.props} />
          {model.displayLogic && <DisplayLogic {...this.props} />}
          <div className={styles.pageContent} style={style}>
            {renderModules && modules.map(this.renderModuleType)}
            {renderModules && showOnAllPages.map(this.renderShadowModule)}
          </div>
        </div>
        <Footer {...this.props} />
      </div>
    )
  }
}

export default Page
