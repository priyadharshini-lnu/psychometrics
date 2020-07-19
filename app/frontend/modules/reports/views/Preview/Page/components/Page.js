import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modules } from 'rb/components/modules'
import store from 'rb/store/PageList'
import AppStore from 'rb/store/AppStore'
import styles from './Page.scss'

class Page extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  renderModuleType = (module, i) => {
    const { model } = this.props
    if (!module.type) { return }
    const View = Modules[module.type]
    return <View key={i} module={module} page={model} preview animation />
  }

  renderShadowModule = (module, i) => {
    const { model } = this.props
    if (module.onPage(model)) { return }
    const View = Modules[module.type]
    return <View key={i} module={module} page={model} preview animation />
  }

  render () {
    const { model = {} } = this.props
    const style = {
      ...AppStore.report.props.sizes,
    }

    return (
      <div className={styles.page} name={model.name}>
        <div className={`${styles.pageContainer} fe-page-container`} style={style}>
          <div className={styles.pageContent}>
            {model.modules.list.map(this.renderModuleType)}
            {store.showOnAllPages.list.map(this.renderShadowModule)}
          </div>
        </div>
      </div>
    )
  }
}

export default Page
