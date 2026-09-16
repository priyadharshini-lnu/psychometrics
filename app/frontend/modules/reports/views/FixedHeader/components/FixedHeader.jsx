import {
  useEffect, useRef, useState, useReducer,
} from 'react'
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
import useAsyncRequestResponse from '~/hooks/useAsyncRequestResponse'
import { AsyncRequestResponseTR } from '~/modules/admin/modules/client/core/asyncRequestResponse'
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

export const FixedHeader = ({
  report, currentPage, richEditorOpened, pages, selected, modules, selectedPageId,
  save: saveReport, unselectModules, addModule: addModuleAction,
  updateCurrentPage, pasteModule, selectModules, removeModule, updateModule,
  openSettings, openFilter, openDataSheet, openAlias, openDataConfiguration, openRemapAssessment,
}) => {
  const [publishing, setPublishing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmPublishOpen, setConfirmPublishOpen] = useState(false)
  const [, forceRerender] = useReducer(count => count + 1, 0)

  const menuRef = useRef(null)

  // Keeps document-level listeners (registered once on mount) reading up-to-date props
  const propsRef = useRef()
  propsRef.current = {
    report,
    currentPage,
    richEditorOpened,
    pages,
    selected,
    modules,
    selectedPageId,
    updateCurrentPage,
    pasteModule,
    selectModules,
    removeModule,
    updateModule,
    unselectModules,
  }

  const { makeAsyncRequest: publishRequest } = useAsyncRequestResponse({
    url: `/administration/reports/${report.builder.id}/builders/publish`,
    responseType: AsyncRequestResponseTR,
  })

  useEffect(() => {
    const handleScroll = _.debounce((e) => {
      const { updateCurrentPage: updateCurrentPageProp, pages: pagesProp } = propsRef.current
      headerStore.offset = $(menuRef.current).offset()?.top
      updateCurrentPageProp($(e.currentTarget).scrollTop(), pagesProp)
    }, 200)

    const handleKeyDown = (e) => {
      const {
        richEditorOpened: richEditorOpenedProp, removeModule: removeModuleProp,
        selected: selectedProp, unselectModules: unselectModulesProp,
        updateModule: updateModuleProp, report: reportProp, modules: modulesProp,
      } = propsRef.current
      if (e.target.nodeName === 'INPUT') { return }
      if (e.target.nodeName === 'TEXTAREA') { return }
      if (richEditorOpenedProp) { return }
      if (e.keyCode === 27) {
        unselectModulesProp()
      }
      if (e.keyCode === 8 || e.keyCode === 46) {
        unselectModulesProp()
        selectedProp.forEach((moduleId) => {
          removeModuleProp(moduleId)
        })
      }

      if (modulesProp.length > 0 && [37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault()
        const { width, height } = reportProp.builder.props.sizes
        const multiplier = e.shiftKey ? 10 : 1
        modulesProp.forEach((module) => {
          const position = { ...module.props.position }
          if (e.keyCode === 40) { position.top += 1 * multiplier } // down
          if (e.keyCode === 38) { position.top -= 1 * multiplier } // up
          if (e.keyCode === 37) { position.left -= 1 * multiplier } // left
          if (e.keyCode === 39) { position.left += 1 * multiplier } // right
          position.top = Math.round(position.top < 0 ? 0 : position.top)
          position.top = Math.round(position.top + position.height > height ? height - position.height : position.top)
          position.left = Math.round(position.left < 0 ? 0 : position.left)
          position.left = Math.round(position.left + position.width > width ? width - position.width : position.left)
          updateModuleProp({ ...module, props: { ...module.props, position: { ...position } } })
        })
      }
    }

    const handleCopy = ({ originalEvent }) => {
      const {
        richEditorOpened: richEditorOpenedProp, selected: selectedProp,
        modules: modulesProp, selectedPageId: selectedPageIdProp,
      } = propsRef.current

      if (document.getSelection().toString() && selectedProp.length < 2) { return }

      if (!selectedProp.length) { return }

      if (originalEvent.target) {
        if (originalEvent.target.tagName === 'INPUT' || originalEvent.target.tagName === 'TEXTAREA') {
          return
        }
      }

      if (richEditorOpenedProp) { return }

      const data = {
        type: 'Module',
        data: { modules: modulesProp, pageId: selectedPageIdProp },
      }

      originalEvent.preventDefault()
      originalEvent.clipboardData.setData('text/plain', JSON.stringify(data))
    }

    const handlePaste = ({ originalEvent }) => {
      const {
        richEditorOpened: richEditorOpenedProp, pasteModule: pasteModuleProp,
        currentPage: currentPageProp, selectModules: selectModulesProp, report: reportProp,
      } = propsRef.current
      if (richEditorOpenedProp) { return }

      if (originalEvent.target) {
        if (originalEvent.target.tagName === 'INPUT' || originalEvent.target.tagName === 'TEXTAREA') {
          return
        }
      }

      originalEvent.preventDefault()
      const data = originalEvent.clipboardData.getData('text/plain')
      try {
        const { type, data: { modules: pastedModules, pageId } } = JSON.parse(data)
        if (type === 'Module') {
          const modulesToSelect = []
          pastedModules.forEach((moduleData) => {
            const assessmentId = reportProp.builder.assessments[moduleData.assessment_id]
              ? moduleData.assessment_id
              : null
            delete moduleData.props.pagination
            const module = new Module(
              { ..._.cloneDeep(moduleData), id: null, assessment_id: assessmentId },
              currentPageProp,
            )
            if (currentPageProp.id === pageId) {
              module.shift()
            }
            pasteModuleProp(currentPageProp.id, module)
            modulesToSelect.push(module.id)
          })

          selectModulesProp({ moduleIds: modulesToSelect, pageId: currentPageProp.id })
        }
      } catch (e) { /* empty */ }
    }

    $(document).on('scroll', handleScroll)
    $(document).on('keydown', handleKeyDown)
    $(document).on('copy', handleCopy)
    $(document).on('paste', handlePaste)
    window.onbeforeunload = () => I18n.t('common.messages.leave_message')
    window.onpopstate = () => I18n.t('common.messages.leave_message')

    const listener = AppStore.addListener('change', () => forceRerender())

    return () => {
      $(document).off('scroll', handleScroll)
      $(document).off('keydown', handleKeyDown)
      $(document).off('copy', handleCopy)
      $(document).off('paste', handlePaste)
      window.onbeforeunload = null
      window.onpopstate = null
      listener.remove()
    }
  }, [])

  const handleAddModule = (type) => {
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
    addModuleAction(currentPage.id, module)
  }

  const addText = () => handleAddModule('Text')
  const addImage = () => handleAddModule('Image')
  const addShape = () => handleAddModule('Shape')
  const addGraph = () => handleAddModule('Graph')
  const addTable = () => handleAddModule('Table')

  const handleSave = () => {
    unselectModules()
    setSaving(true)

    saveReport(report).then(({ response: { data } }) => {
      const normalizedData = normalize(data, schema)
      unselectModules()
      AppStore.init(data.data)
      store.dispatch({ type: INIT, data: normalizedData })
      message.success(I18n.t('admin.report_builder_save_success'))
    }).catch(() => {
      message.error(I18n.t('admin.report_builder_save_failed'))
    }).finally(() => {
      setSaving(false)
    })
  }

  const publishReport = async () => {
    unselectModules()
    setPublishing(true)

    let saveResponse
    try {
      saveResponse = await saveReport(report)
    } catch {
      message.error(I18n.t('admin.report_builder_save_failed'))
      setPublishing(false)
      return
    }

    const savedData = saveResponse.response.data
    unselectModules()
    AppStore.init(savedData.data)
    store.dispatch({ type: INIT, data: normalize(savedData, schema) })

    try {
      const result = await publishRequest()
      if (result.processingStatus === 'completed') {
        const { data } = result.responseData
        AppStore.init(data.data)
        store.dispatch({ type: INIT, data: normalize(data, schema) })
        message.success(I18n.t('admin.report_builder_publish_success'))
      } else {
        message.error(I18n.t('admin.report_builder_publish_failed'))
      }
    } catch {
      message.error(I18n.t('admin.report_builder_publish_failed'))
    } finally {
      setPublishing(false)
    }
  }

  const saveAndPublish = () => {
    const { published_at: publishedAt } = report.builder

    if (!publishedAt) {
      publishReport()
      return
    }

    setConfirmPublishOpen(true)
  }

  const closeConfirmPublish = () => {
    setConfirmPublishOpen(false)
  }

  const openSettingsModal = () => {
    openSettings()
  }

  const openFilterModal = () => {
    openFilter({ filters: AppStore.report.filters })
  }

  const openDataSheetModal = () => {
    openDataSheet({ columns: AppStore.report.dataSheetColumns, id: report.builder.id })
  }

  const openAliasModal = () => {
    openAlias({ factors: AppStore.flatFactors })
  }

  const openDataConfigurationModal = () => {
    openDataConfiguration()
  }

  const handleOpenRemapAssessment = () => {
    openRemapAssessment()
  }

  const {
    builder: {
      available_languages: availableLanguages,
      default_language: defaultLanguage,
      published_at: publishedAt,
      published_by_name: publishedByName,
      has_unpublished_changes: hasUnpublishedChanges,
    },
  } = report
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
    <div ref={menuRef} id="fixed_header" className={styles.header} style={style}>
      {richEditorOpened ? <div key="editor" id="froala-editor-toolbar" /> : (
        <div key="menu" className={styles.components}>
          <Flex align="center">
            <Button type="link" href="/admin/reports">
              <ArrowLeftOutlined />
              Reports List
            </Button>
            <div className={styles.set}>
              <a onClick={addTable}>
                <span className={styles.plus}>+</span>
                <span className="fa fa-table" />
                Table
              </a>
              <a onClick={addGraph}>
                <span className={styles.plus}>+</span>
                <span className="fa fa-bar-chart" />
                Graph
              </a>
              <a onClick={addShape}>
                <span className={styles.plus}>+</span>
                <span className="fa fa-square-o" />
                Shape
              </a>
              <a onClick={addText}>
                <span className={styles.plus}>+</span>
                <span className="fa fa-font" />
                Text
              </a>
              <a onClick={addImage}>
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
                  onClick={handleSave}
                  loading={saving || publishing}
                  trigger={['click']}
                  icon={<DownOutlined />}
                  menu={{
                    items: [
                      {
                        key: 'save_and_publish',
                        label: I18n.t('admin.report_builder_save_and_publish'),
                        onClick: saveAndPublish,
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
                  onClick={saveAndPublish}
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
                      onClick: openSettingsModal,
                    },
                    {
                      key: 'manage_filters',
                      label: 'Manage Filters',
                      onClick: openFilterModal,
                    },
                    {
                      key: 'manage_data_sheets',
                      label: 'Manage DataSheets',
                      onClick: openDataSheetModal,
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
                      onClick: openAliasModal,
                    },
                    {
                      key: 'data_report_configuration',
                      label: 'Data Report Configuration',
                      onClick: openDataConfigurationModal,
                    },
                    {
                      key: 'remap_assessment',
                      label: 'Remap Assessment',
                      onClick: handleOpenRemapAssessment,
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
          onConfirm={publishReport}
          close={closeConfirmPublish}
        />
      )}
    </div>
  )
}

export default FixedHeader
