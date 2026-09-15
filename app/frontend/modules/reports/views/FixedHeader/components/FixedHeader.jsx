import { Component } from 'react'
import _ from 'lodash'
import { normalize } from 'normalizr'
import {
  Space, Flex, Button, message, Dropdown, Tag, Tooltip,
} from 'antd'
import {
  ArrowLeftOutlined, SettingOutlined, DownOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { ConfirmationModal } from '~/glint'
import headerStore from '~/modules/reports/store/HeaderStore'
import AppStore from '~/modules/reports/store/AppStore'
import Module from '~/modules/reports/models/Module'
import { getModule } from '~/modules/reports/core/builder/selectors'
import store from '~/modules/reports/store'
import schema from '~/modules/reports/store/schema'
import { INIT } from '~/modules/reports/core/builder/actions'
import styles from './FixedHeader.less'
import { LangDropdown } from '~/components/LangDropdown'
import dayjs from '~/utils/dayjs'

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
  state = { publishing: false, saving: false, confirmPublishOpen: false }

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

  save = () => {
    const { save, report, unselectModules } = this.props
    unselectModules()
    this.setState({ saving: true })

    save(report).then(({ response: { data } }) => {
      const normalizedData = normalize(data, schema)
      unselectModules()
      AppStore.init(data.data)
      store.dispatch({ type: INIT, data: normalizedData })
      message.success(I18n.t('admin.report_builder_save_success'))
    }).catch(() => {
      message.error(I18n.t('admin.report_builder_save_failed'))
    }).finally(() => {
      this.setState({ saving: false })
    })
  }

  saveAndPublish = () => {
    const { report: { builder: { published_at: publishedAt } } } = this.props

    if (!publishedAt) {
      this.publishReport()
      return
    }

    this.setState({ confirmPublishOpen: true })
  }

  closeConfirmPublish = () => {
    this.setState({ confirmPublishOpen: false })
  }

  publishReport = async () => {
    const {
      save, publish, report, unselectModules,
    } = this.props
    unselectModules()
    this.setState({ publishing: true })

    let saveResponse
    try {
      saveResponse = await save(report)
    } catch {
      message.error(I18n.t('admin.report_builder_save_failed'))
      this.setState({ publishing: false })
      return
    }

    const savedData = saveResponse.response.data
    unselectModules()
    AppStore.init(savedData.data)
    store.dispatch({ type: INIT, data: normalize(savedData, schema) })

    try {
      const { response: { data } } = await publish(report)
      AppStore.init(data.data)
      store.dispatch({ type: INIT, data: normalize(data, schema) })
      message.success(I18n.t('admin.report_builder_publish_success'))
    } catch {
      message.error(I18n.t('admin.report_builder_publish_failed'))
    } finally {
      this.setState({ publishing: false })
    }
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
    const { publishing, saving, confirmPublishOpen } = this.state
    const {
      richEditorOpened, report: {
        builder: {
          available_languages: availableLanguages,
          default_language: defaultLanguage,
          published_at: publishedAt,
          published_by_name: publishedByName,
          has_unpublished_changes: hasUnpublishedChanges,
        },
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
    const publishedViewUrl = `/administration/reports/${_.result(AppStore.report, 'id')}/preview?published_view=true`
    const publishLabel = publishedAt
      ? I18n.t('admin.report_builder_published_at', { date: dayjs(publishedAt).format('D MMM YYYY, HH:mm') })
      : null

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
              <Space align="center">
                <Space size={4} align="center">
                  {hasUnpublishedChanges && (
                    <Tag color="warning" bordered={false}>
                      {I18n.t('admin.report_builder_unpublished_changes')}
                    </Tag>
                  )}
                  {publishLabel && (
                    <Tooltip
                      title={publishedByName
                        ? I18n.t('admin.report_builder_published_by', { name: publishedByName })
                        : undefined}
                    >
                      <span style={{ fontSize: 11, color: '#8c8c8c' }}>{publishLabel}</span>
                    </Tooltip>
                  )}
                </Space>
                <LangDropdownWithChangeUrl locales={locales} defaultLanguage={defaultLanguage.code} />
                {publishedAt ? (
                  <Dropdown.Button
                    type="primary"
                    onClick={this.save}
                    loading={saving || publishing}
                    trigger={['click']}
                    icon={<DownOutlined />}
                    menu={{
                      items: [
                        {
                          key: 'save_and_publish',
                          label: I18n.t('admin.report_builder_save_and_publish'),
                          onClick: this.saveAndPublish,
                        },
                        {
                          key: 'view_published',
                          label: I18n.t('admin.report_builder_view_published'),
                          onClick: () => window.open(publishedViewUrl, '_blank'),
                        },
                      ],
                    }}
                  >
                    {I18n.t('admin.report_builder_save_as_draft')}
                  </Dropdown.Button>
                ) : (
                  <Button
                    type="primary"
                    onClick={this.saveAndPublish}
                    loading={saving || publishing}
                  >
                    {I18n.t('admin.report_builder_save_and_publish')}
                  </Button>
                )}
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
        {confirmPublishOpen && (
          <ConfirmationModal
            open
            title={I18n.t('admin.report_builder_publish_confirm_title')}
            message={I18n.t('admin.report_builder_publish_confirm_content')}
            onConfirm={this.publishReport}
            close={this.closeConfirmPublish}
          />
        )}
      </div>
    )
  }
}

export default FixedHeader
