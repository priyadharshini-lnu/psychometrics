import { Component } from 'react'
import _ from 'lodash'
import { normalize } from 'normalizr'
import {
  Space, Flex, Button, message, Dropdown,
} from 'antd'
import { ArrowLeftOutlined, SettingOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import headerStore from '~/modules/reports/store/HeaderStore'
import AppStore from '~/modules/reports/store/AppStore'
import Module from '~/modules/reports/models/Module'
import { getModule } from '~/modules/reports/core/builder/selectors'
import store from '~/modules/reports/store'
import schema from '~/modules/reports/store/schema'
import { INIT } from '~/modules/reports/core/builder/actions'
import styles from './FixedHeader.less'
import { LangDropdown } from '~/components/LangDropdown'

const { $ } = window
const defaultLocales = ['en']

export const LangDropdownWithChangeUrl = ({ locales = defaultLocales, defaultLanguage }) => {
  const handleLanguageChange = (key) => {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set('lang', key)
    window.location.search = searchParams.toString()
  }

  const currentLocale = new URLSearchParams(window.location.search).get('lang') || defaultLanguage

  return (
    <LangDropdown
      locales={locales}
      currentLocale={currentLocale}
      onChange={handleLanguageChange}
    />
  )
}

export class FixedHeader extends Component {
  componentDidMount () {
    $(document).on('scroll', _.debounce(e => this.bodyScroll(e), 200))
    $(document).on('keydown', this.bodyKeyDown)
    $(document).on('copy', this.onCopy)
    $(document).on('paste', this.onPaste)
    window.onbeforeunload = () => I18n.t('common.messages.leave_message')
    window.onpopstate = () => I18n.t('common.messages.leave_message')
    this.listener = AppStore.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    $(document).off('scroll', this.bodyScroll)
    $(document).off('keydown', this.bodyKeyDown)
    $(document).off('copy', this.onCopy)
    $(document).off('paste', this.onPaste)
    window.onbeforeunload = null
    window.onpopstate = null
    this.listener.remove()
  }

  bodyScroll = (e) => {
    const { updateCurrentPage, pages } = this.props
    headerStore.offset = $(this.menu).offset()?.top
    updateCurrentPage($(e.currentTarget).scrollTop(), pages)
  }

  onCopy = ({ originalEvent }) => {
    const {
      richEditorOpened, selected, modules, selectedPageId,
    } = this.props

    if (document.getSelection().toString() && selected.length < 2) { return }

    if (!selected.length) { return }

    if (originalEvent.target) {
      if (originalEvent.target.tagName === 'INPUT' || originalEvent.target.tagName === 'TEXTAREA') {
        return
      }
    }

    if (richEditorOpened) { return }

    const data = {
      type: 'Module',
      data: { modules, pageId: selectedPageId },
    }

    originalEvent.preventDefault()
    originalEvent.clipboardData.setData('text/plain', JSON.stringify(data))
  }

  onPaste = ({ originalEvent }) => {
    const {
      richEditorOpened, pasteModule, currentPage, selectModules, report,
    } = this.props
    if (richEditorOpened) { return }

    if (originalEvent.target) {
      if (originalEvent.target.tagName === 'INPUT' || originalEvent.target.tagName === 'TEXTAREA') {
        return
      }
    }

    originalEvent.preventDefault()
    const data = originalEvent.clipboardData.getData('text/plain')
    try {
      const { type, data: { modules, pageId } } = JSON.parse(data)
      if (type === 'Module') {
        const modulesToSelect = []
        modules.forEach((moduleData) => {
          const assessmentId = report.builder.assessments[moduleData.assessment_id]
            ? moduleData.assessment_id
            : null
          delete moduleData.props.pagination
          const module = new Module({ ..._.cloneDeep(moduleData), id: null, assessment_id: assessmentId }, currentPage)
          if (currentPage.id === pageId) {
            module.shift()
          }
          pasteModule(currentPage.id, module)
          modulesToSelect.push(module.id)
        })

        selectModules({ moduleIds: modulesToSelect, pageId: currentPage.id })
      }
    } catch (e) { /* empty */ }
  }

  bodyKeyDown = (e) => {
    const {
      richEditorOpened, removeModule, selected, unselectModules,
      updateModule, report, modules,
    } = this.props
    if (e.target.nodeName === 'INPUT') { return }
    if (e.target.nodeName === 'TEXTAREA') { return }
    if (richEditorOpened) { return }
    if (e.keyCode === 27) {
      unselectModules()
    }
    if (e.keyCode === 8 || e.keyCode === 46) {
      unselectModules()
      selected.forEach((moduleId) => {
        removeModule(moduleId)
      })
    }

    if (modules.length > 0 && [37, 38, 39, 40].includes(e.keyCode)) {
      e.preventDefault()
      const { width, height } = report.builder.props.sizes
      const multiplier = e.shiftKey ? 10 : 1
      modules.forEach((module) => {
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
      })
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

  save = (e) => {
    const { save, report, unselectModules } = this.props
    const target = e.currentTarget
    unselectModules()
    target.setAttribute('disabled', 'disabled')

    save(report).then(({ response: { data } }) => {
      target.removeAttribute('disabled')
      const normalizedData = normalize(data, schema)
      unselectModules()
      AppStore.init(data.data)
      store.dispatch({ type: INIT, data: normalizedData })
      message.success('Report successfully saved')
    }).catch(() => {
      target.removeAttribute('disabled')
      message.error('Something went wrong. Contact your administrator.')
    })
  }

  openSettingsModal = () => {
    const { openSettings } = this.props
    openSettings()
  }

  openFilterModal = () => {
    const { openFilter } = this.props
    openFilter({ filters: AppStore.report.filters })
  }

  openDataSheetModal = () => {
    const { openDataSheet, report: { builder } } = this.props
    openDataSheet({ columns: AppStore.report.dataSheetColumns, id: builder.id })
  }

  openAliasModal = () => {
    const { openAlias } = this.props
    openAlias({ factors: AppStore.flatFactors })
  }

  openDataConfigurationModal = () => {
    const { openDataConfiguration } = this.props
    openDataConfiguration()
  }

  openRemapAssessment = () => {
    const { openRemapAssessment } = this.props
    openRemapAssessment()
  }


  render () {
    const {
      richEditorOpened, report: {
        builder: { available_languages: availableLanguages, default_language: defaultLanguage },
      },
    } = this.props
    const style = {
      position: 'fixed',
      top: 0,
      minWidth: 0,
      left: 0,
      width: '100%',
    }
    const locales = availableLanguages?.map(l => l.code)

    return (
      <div ref={(ref) => { this.menu = ref }} id="fixed_header" className={styles.header} style={style}>
        {richEditorOpened ? <div key="editor" id="froala-editor-toolbar" /> : (
          <div key="menu" className={styles.components}>
            <Flex align="center">
              <Button type="link" href="/admin/reports">
                <ArrowLeftOutlined />
                Reports List
              </Button>
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
            </Flex>

            <div className={`${styles.rightSet}`}>
              <Space>
                <LangDropdownWithChangeUrl locales={locales} defaultLanguage={defaultLanguage.code} />
                <Button onClick={this.save} type="primary">
                  Save
                </Button>
                <Dropdown
                  trigger={['click']}
                  menu={{
                    items: [
                      {
                        key: 'settings_modal',
                        label: 'Settings...',
                        onClick: this.openSettingsModal,
                      },
                      {
                        key: 'manage_filters',
                        label: 'Manage Filters',
                        onClick: this.openFilterModal,
                      },
                      {
                        key: 'manage_data_sheets',
                        label: 'Manage DataSheets',
                        onClick: this.openDataSheetModal,
                      },
                      {
                        key: 'preview',
                        label: (
                          <a href={`/administration/reports/${_.result(AppStore.report, 'id')}/preview`}>
                            Preview
                          </a>
                        ),
                      },
                      {
                        key: 'aliases',
                        label: 'Aliases',
                        onClick: this.openAliasModal,
                      },
                      {
                        key: 'data_report_configuration',
                        label: 'Data Report Configuration',
                        onClick: this.openDataConfigurationModal,
                      },
                      {
                        key: 'remap_assessment',
                        label: 'Remap Assessment',
                        onClick: this.openRemapAssessment,
                      },
                    ],
                  }}
                >
                  <Button block>
                    <Space>
                      Report Options
                      <SettingOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              </Space>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default FixedHeader
