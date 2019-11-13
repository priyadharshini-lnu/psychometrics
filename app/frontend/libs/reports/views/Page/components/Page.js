import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modules } from 'rb/components/modules'
import panelStore from 'rb/store/PropertyPanelStore'
import AppStore from 'rb/store/AppStore'
import store from 'rb/store/PageList'
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
    const { model } = this.props
    if (!module.type) { return false }
    const View = Modules[module.type]
    return !module.removed && <View key={i} module={module} page={model} />
  }

  renderShadowModule = (module, i) => {
    const { model } = this.props
    if (module.onPage(model)) { return }
    const View = Modules[module.type]
    return <View key={i} module={module} page={model} />
  }

  selectPage = (e) => {
    const { model } = this.props
    e.stopPropagation()
    store.unselectAll()
    panelStore.select('Page', model)
  }

  render () {
    const { model = {}, renderModules } = this.props

    const selected = panelStore.model === model

    const style = {
      ...AppStore.report.props.sizes,
    }
    return (
      <div className={styles.page} name={model.id} onClick={this.selectPage}>
        <div
          className={`${styles.pageContainer} ${selected ? styles.selected : ''}`}
          style={{ width: AppStore.report.props.sizes.width }}
        >
          <Header {...this.props} />
          {model.displayLogic && <DisplayLogic {...this.props} />}
          <div className={styles.pageContent} style={style}>
            {renderModules && model.modules.list.map(this.renderModuleType)}
            {renderModules && store.showOnAllPages.list.map(this.renderShadowModule)}
          </div>
        </div>
        <Footer {...this.props} />
      </div>
    )
  }
}

export default Page
