import { Component } from 'react'
import PropTypes from 'prop-types'
import { Modules } from '~/modules/reports/components/modules'
import panelStore from '~/modules/reports/store/PropertyPanelStore'
import ModuleModel from '~/modules/reports/models/Module'
import RichEditorStore from '~/modules/reports/store/RichEditorStore'
import PageModel from '~/modules/reports/models/Page'
import styles from './Page.less'
import Header from './PageHeader'
import Footer from './PageFooter'
import DisplayLogic from './DisplayLogic/DisplayLogic'
import Module from './Module'

class Page extends Component {
  storeListener = null

  static propTypes = {
    model: PropTypes.object.isRequired,
    last: PropTypes.bool,
    renderModules: PropTypes.bool,
  }

  selectPage = (e) => {
    const { model, unselectModules, selectModule } = this.props
    e.stopPropagation()
    unselectModules()
    RichEditorStore.close()
    selectModule('Page', model)
  }

  renderModuleType = (module, i) => {
    const { model: page } = this.props

    // NOTE: @fedor temporary kept update for connects
    return <Module key={i} moduleId={module.id} page={page} />
  }

  renderShadowModule = (module, i) => {
    const { model: page } = this.props
    const model = new ModuleModel(module, page)
    const View = Modules[model.type]
    return <View key={i} module={model} page={page} shadow />
  }

  render () {
    const {
      report, report: { builder }, modules, model = {}, showOnAllPages,
      renderMoudles,
    } = this.props
    const selected = panelStore.model === model
    const page = new PageModel(model, report.completed_assessments)

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
          {renderMoudles && page.displayLogic && <DisplayLogic {...this.props} model={page} />}
          <div className={styles.pageContent} style={style}>
            {renderMoudles && modules.map(this.renderModuleType)}
            {renderMoudles && showOnAllPages.map(this.renderShadowModule)}
          </div>
        </div>
        <Footer {...this.props} />
      </div>
    )
  }
}

export default Page
