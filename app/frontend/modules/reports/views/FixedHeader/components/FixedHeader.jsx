import { Component } from 'react'
import _ from 'lodash'
import { normalize } from 'normalizr'
import headerStore from '~/modules/reports/store/HeaderStore'
import AppStore from '~/modules/reports/store/AppStore'
import I18nStore from '~/modules/reports/store/I18nStore'
import NotificationDispatcher from '~/modules/reports/dispatchers/NotificationDispatcher'
import Module from '~/modules/reports/models/Module'
import { getModule } from '~/modules/reports/core/builder/selectors'
import store from '~/modules/reports/store'
import schema from '~/modules/reports/store/schema'
import { INIT } from '~/modules/reports/core/builder/actions'
import styles from './FixedHeader.less'

const { $ } = window

export class FixedHeader extends Component {
  componentDidMount () {
    $(document).on('scroll', _.debounce(e => this.bodyScroll(e), 200))
    $(document).on('keydown', this.bodyKeyDown)
    $(document).on('copy', this.onCopy)
    $(document).on('paste', this.onPaste)
    this.listener = AppStore.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    $(document).off('scroll', this.bodyScroll)
    $(document).off('keydown', this.bodyKeyDown)
    $(document).off('copy', this.onCopy)
    $(document).off('paste', this.onPaste)
    this.listener.remove()
  }

  bodyScroll = (e) => {
    const { updateCurrentPage, pages } = this.props
    headerStore.offset = $(this.menu).offset()?.top
    updateCurrentPage($(e.currentTarget).scrollTop(), pages)
  }

  onCopy = ({ originalEvent }) => {
    const {
      richEditorOpened, selected, module,
    } = this.props

    if (selected?.type !== 'Module') { return }

    if (originalEvent.target) {
      if (originalEvent.target.tagName === 'INPUT') {
        return
      }
    }

    if (richEditorOpened) { return }

    const data = {
      type: 'Module',
      data: module,
    }

    originalEvent.preventDefault()
    originalEvent.clipboardData.setData('text/plain', JSON.stringify(data))
  }

  onPaste = ({ originalEvent }) => {
    const {
      richEditorOpened, pasteModule, currentPage, selectModule,
    } = this.props
    if (richEditorOpened) { return }

    if (originalEvent.target) {
      if (originalEvent.target.tagName === 'INPUT') {
        return
      }
    }

    originalEvent.preventDefault()
    const data = originalEvent.clipboardData.getData('text/plain')
    try {
      const { type, data: moduleData } = JSON.parse(data)
      if (type === 'Module') {
        const module = new Module({ ..._.cloneDeep(moduleData), id: null }, currentPage)
        module.shift()
        pasteModule(currentPage.id, module)
        selectModule('Module', module.id)
      }
    } catch (e) { /* empty */ }
  }

  bodyKeyDown = (e) => {
    const {
      richEditorOpened, removeModule, selected, unselectModules,
      module, updateModule, report,
    } = this.props
    if (e.target.nodeName === 'INPUT') { return }
    if (e.target.nodeName === 'TEXTAREA') { return }
    if (richEditorOpened) { return }
    if (e.keyCode === 8 || e.keyCode === 46) {
      unselectModules()
      selected.moduleId && removeModule(selected.moduleId)
    }

    if (module && [37, 38, 39, 40].includes(e.keyCode)) {
      e.preventDefault()
      const { width, height } = report.builder.props.sizes
      const multiplier = e.shiftKey ? 10 : 1
      const position = { ...module.props.position }
      if (e.keyCode === 40) { position.top += 1 * multiplier } // down
      if (e.keyCode === 38) { position.top -= 1 * multiplier } // up
      if (e.keyCode === 37) { position.left -= 1 * multiplier } // left
      if (e.keyCode === 39) { position.left += 1 * multiplier } // right
      position.top = Math.round(position.top < 0 ? 0 : position.top)
      position.top = Math.round(position.top + position.height > height ? height - position.height : position.top)
      position.left = Math.round(position.left < 0 ? 0 : position.left)
      position.left = Math.round(position.left + position.width > width ? width - position.width : position.left)
      updateModule({ ...module, props: { ...module.props, position: { ...position } } })
    }
  }

  addModule = (type) => {
    const { report, addModule, currentPage } = this.props
    const module = new Module({ type }, currentPage)

    const last = getModule(report, _.last(currentPage.modules))
    if (last) {
      module.props.position.top = Math.min(last.props.position.top + last.props.position.height, 1100 - 200)
      module.props.position.left = last.props.position.left
    }
    if (last && last.props.position.top === module.props.position.top) {
      module.props.position.top = 120
      module.props.position.left += 20
    }
    addModule(currentPage.id, module)
  }

  addText = () => {
    this.addModule('Text')
  }

  addImage = () => {
    this.addModule('Image')
  }

  addShape = () => {
    this.addModule('Shape')
  }

  addGraph = () => {
    this.addModule('Graph')
  }

  addTable = () => {
    this.addModule('Table')
  }


  export = () => {
    this.data.value = JSON.stringify(I18nStore.exportReport())
    this.form.submit()
  }

  save = (e) => {
    const { save, report } = this.props
    const target = e.currentTarget
    target.setAttribute('disabled', 'disabled')

    save(report).then(({ response: { data } }) => {
      target.removeAttribute('disabled')
      const normalizedData = normalize(data, schema)
      AppStore.init(data.data)
      store.dispatch({ type: INIT, data: normalizedData })
      NotificationDispatcher.notify({ message: 'Report successfully saved' })
    }).catch(() => {
      target.removeAttribute('disabled')
      NotificationDispatcher.notify({ level: 'error', message: 'Something went wrong. Contact your administrator.' })
    })
  }

  openFilterModal = () => {
    const { openFilter } = this.props
    openFilter({ filters: AppStore.report.filters })
  }

  openDataSheetModal = () => {
    const { openDataSheet, report: { builder } } = this.props
    openDataSheet({ columns: AppStore.report.dataSheetColumns, id: builder.id })
  }

  openCampaignFactorsModal = () => {
    const { openCampaignFactors, report: { builder } } = this.props
    openCampaignFactors({ columns: builder.campaign_factors, id: builder.id })
  }

  openAliasModal = () => {
    const { openAlias } = this.props
    openAlias({ factors: AppStore.flatFactors })
  }

  openDataConfigurationModal = () => {
    const { openDataConfiguration } = this.props
    openDataConfiguration()
  }

  render () {
    const { richEditorOpened } = this.props
    const style = {
      position: 'fixed',
      top: 0,
      minWidth: 0,
      left: 0,
      width: '100%',
    }

    return (
      <div ref={(ref) => { this.menu = ref }} className={styles.header} style={style}>
        {richEditorOpened ? <div key="editor" id="froala-editor-toolbar" /> : (
          <div key="menu" className={styles.components}>
            <div
              ref={(ref) => { this.cktoolbar = ref }}
              className={styles.ckContainer}
              style={{ display: headerStore.showCK ? 'block' : 'none' }}
            />
            <div className={styles.set}>
              <a onClick={this.addTable}>
                <span className={styles.plus}>+</span>
                <span className="fa fa-table" />
                Table
              </a>
              <a onClick={this.addGraph}>
                <span className={styles.plus}>+</span>
                <span className="fa fa-bar-chart" />
                Graph
              </a>
              <a onClick={this.addShape}>
                <span className={styles.plus}>+</span>
                <span className="fa fa-square-o" />
                Shape
              </a>
              <a onClick={this.addText}>
                <span className={styles.plus}>+</span>
                <span className="fa fa-font" />
                Text
              </a>
              <a onClick={this.addImage}>
                <span className={styles.plus}>+</span>
                <span className="fa fa-image" />
                Image
              </a>
            </div>
            <div className={`${styles.set} ${styles.rightSet}`}>
              <button onClick={this.save} className={`btn btn-success ${styles.saveButton}`}>
                <i className="fa fa-save" />
                Save
              </button>
              <div className="dropdown">
                <button
                  className="btn btn-default dropdown-toggle"
                  type="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="true"
                >
                  <span className="fa fa-gear" />
                  Report Options
                  <span className="caret" />
                </button>
                <ul className="dropdown-menu">
                  <li><a onClick={this.openFilterModal}>Manage Filters</a></li>
                  <li><a onClick={this.openDataSheetModal}>Manage DataSheets</a></li>
                  <li><a onClick={this.openCampaignFactorsModal}>Manage Campagin Factors</a></li>
                  <li><a onClick={this.export}>Export Translations</a></li>
                  <li>
                    <a
                      className={styles.linkExport}
                      data-remote="true"
                      href={`/administration/translations/reports/${_.result(AppStore.report, 'id')}/new`}
                    >
                      Import Translations
                    </a>

                  </li>
                  <li><a href={`/administration/reports/${_.result(AppStore.report, 'id')}/preview`}>Preview</a></li>
                  <li><a onClick={this.openAliasModal}>Aliases</a></li>
                  <li><a onClick={this.openDataConfigurationModal}>Data Report Configuration</a></li>
                </ul>
                <form
                  style={{ display: 'none' }}
                  ref={(ref) => { this.form = ref }}
                  action={`/administration/translations/reports/${_.result(AppStore.report, 'id')}/export`}
                  method="POST"
                >
                  <input name="authenticity_token" type="hidden" value={$('meta[name=csrf-token]').attr('content')} />
                  <input ref={(ref) => { this.data = ref }} name="data" />
                </form>
              </div>
              <div>
                <a href="/admin/reports" className={`btn btn-default ${styles.back}`}>Back</a>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default FixedHeader
