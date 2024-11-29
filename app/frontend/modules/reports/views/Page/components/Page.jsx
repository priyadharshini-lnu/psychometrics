import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
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
import { actions } from '~/modules/reports/core/temp/selection'
import FoundationSelected from '~/modules/reports/components/FoundationSelected'

const Page = (props) => {
  const {
    model: pageModel,
    renderMoudles,
    report,
    modules,
    showOnAllPages,
  } = props
  const dispatch = useDispatch()

  const selectPage = (e) => {
    e.stopPropagation()
    if (!e.shiftKey) {
      dispatch(actions.unselectAll())
    }
    RichEditorStore.close()
  }


  const renderModuleType = (module, i) => <Module key={i} moduleId={module.id} page={pageModel} animation={false} />

  const renderShadowModule = (module, i) => {
    const model = new ModuleModel(module, pageModel)
    const View = Modules[model.type]
    return <View key={i} module={model} page={pageModel} shadow animation={false} />
  }

  const selected = panelStore.model === pageModel
  const page = new PageModel(pageModel, report.completed_assessments)

  const style = {
    ...report.builder.props.sizes,
  }

  return (
    <div className={styles.page} name={pageModel.id} onClick={selectPage}>
      <div
        className={`${styles.pageContainer} ${selected ? styles.selected : ''}`}
        style={{ width: report.builder.props.sizes.width }}
      >
        <Header {...props} />
        {renderMoudles && pageModel.displayLogic && <DisplayLogic {...props} model={page} />}
        <div className={styles.pageContent} style={style}>
          {renderMoudles && modules.map(renderModuleType)}
          {renderMoudles && showOnAllPages.map(renderShadowModule)}
          <FoundationSelected pageId={pageModel.id} />
        </div>
      </div>
      <Footer {...props} />
    </div>
  )
}

Page.propTypes = {
  model: PropTypes.object.isRequired,
  last: PropTypes.bool,
  renderMoudles: PropTypes.bool,
  report: PropTypes.object.isRequired,
  modules: PropTypes.array.isRequired,
  showOnAllPages: PropTypes.array.isRequired,
}

export default Page
