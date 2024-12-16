import {
  useEffect, useState, FC,
} from 'react'
import { Button, Checkbox, Popconfirm } from 'antd'
import {
  EditOutlined, CheckOutlined, CloseOutlined, SaveOutlined,
} from '@ant-design/icons'
import { connect, ConnectedProps } from 'react-redux'
import { Store } from 'redux'
import cs from 'classnames'
import FroalaEditor from 'react-froala-wysiwyg'
import _ from 'lodash'
import '~/libs/htmldiff.cjs'
import { openRichEditor, closeRichEditor } from '~/modules/reports/core/builder/actions'
import {
  createTextOverride, updateTextOverride, approveTextOverride, removeTextOverride,
  selectModule, disapproveTextOverride,
} from '~/modules/admin/modules/campaigns/core/userReports'
import { RootState } from '~/modules/reports/core/rootReducers'
import config from '~/modules/reports/components/modules/Text/components/froalaConfig'
import ModuleInterface from '~/modules/reports/core/interfaces/Module'
import { getQuestions } from '~/modules/reports/core/builder/selectors'

import { SafeHTML } from '~/components/SafeHTML'
import styles from './styles.less'
import { TextModuleContent } from './TextModuleContent'

const connector = connect(
  (state: RootState, { rstore, module }: {rstore: Store, module: ModuleInterface}) => ({
    richEditorOpened: state.report.builder.richEditorOpened,
    userReport: rstore?.getState().campaigns.userReports.current,
    questions: state.report.builder.loaded ? getQuestions(state.report, module.assessment_id) || {} : {},
    rstore,
  }),
  (dispatch, { rstore }: {rstore: Store}) => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    approveTextOverride: (...args:[number, {}]): any => rstore.dispatch(approveTextOverride(...args)),
    disapproveTextOverride: (...args:[number, number]) => rstore.dispatch(disapproveTextOverride(...args)),
    removeTextOverride: (...args:[number, number, number]) => rstore.dispatch(removeTextOverride(...args)),
    openReviewEditor: () => rstore.dispatch(openRichEditor()),
    closeReviewEditor: () => rstore.dispatch(closeRichEditor()),
    createTextOverride: (...args:[number, {}]) => rstore.dispatch(createTextOverride(...args)),
    updateTextOverride: (...args:[number, number, {}]) => rstore.dispatch(updateTextOverride(...args)),
    selectModule: (...args:[number]) => rstore.dispatch(selectModule(...args)),
  }),
)

interface Override {
  id: number
  content: string
  moduleId: number
  approved: boolean
}

export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & {
  override: Override
  module: ModuleInterface
  allowEdit: boolean
  allowApprove: boolean
}

const OverrideComponent: FC<Props> = ({
  override, userReport, module, allowEdit, allowApprove,
  openReviewEditor, approveTextOverride, closeReviewEditor,
  removeTextOverride, updateTextOverride, createTextOverride,
  selectModule, rstore, disapproveTextOverride, questions,
}) => {
  const [box, setBox] = useState<{}>({})
  const [edit, setEdit] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const [content, setContent] = useState<string>()
  const [selectedModule, setSelectedModule] = useState<number>()
  const [approvingInProgress, setApprovingInProgress] = useState<boolean>(false)

  useEffect(() => {
    const el = document.querySelector(`[name=Module_${module.id}]`) as HTMLElement
    const page = el?.parentElement?.parentElement?.parentElement
    const rect = el?.getBoundingClientRect()
    if (!rect || !parent) { return }
    setBox({
      left: rect?.left - (page?.getBoundingClientRect()?.left || 0),
      top: el?.offsetTop + (page?.offsetTop || 0),
      width: rect?.width,
      height: rect?.height,
    })
    rstore && rstore.subscribe(() => {
      setSelectedModule(rstore.getState().campaigns.userReports.selectedModule)
    })
  }, [])

  const openEditor = (override) => {
    setContent(override?.content)
    openReviewEditor()
    setEdit(true)
  }

  const closeEditor = () => {
    closeReviewEditor()
    setEdit(false)
  }

  const approve = (module, override) => {
    setApprovingInProgress(true)
    approveTextOverride(userReport.campaignId, {
      id: override?.id,
      moduleId: module.id,
      userReportId: userReport.id,
    }).then(() => {
      setApprovingInProgress(false)
    })
  }

  const saveReview = (override) => {
    const { id, campaignId } = userReport || {}
    const data = {
      userReportId: id,
      moduleId: module.id,
      content,
    }
    override ? updateTextOverride(campaignId, override.id, data) : createTextOverride(campaignId, data)
    closeEditor()
  }

  return (
    <div
      className={
        cs(
          styles.editable,
          { [styles.selected]: selectedModule === module.id, [styles.bordered]: allowEdit || allowApprove },
        )
      }
      style={box}
      onClick={() => selectModule(module.id)}
    >
      {edit && (
        <FroalaEditor
          key="editor"
          config={config}
          model={content || TextModuleContent.run(module, questions)}
          onModelChange={content => setContent(content)}
        />
      )}

      {override && (allowEdit || allowApprove) && showDiff && (
        <SafeHTML
          html={htmldiff(TextModuleContent.run(module, questions), override?.content)}
          className={cs(styles.editor, { [styles.diff]: showDiff })}
          config="adminRichText"
        />
      )}

      <div className={styles.buttons}>
        {edit
          ? (
            <>
              <Button
                type="primary"
                size="small"
                onClick={() => saveReview(override)}
                className={cs(styles.edit)}
              >
                <SaveOutlined />
              </Button>
              <Button
                type="primary"
                size="small"
                className={cs(styles.discard)}
                onClick={() => closeEditor()}
              >
                <CloseOutlined />
              </Button>
            </>
          ) : (
            <>
              {override?.content && (allowEdit || allowApprove) && (
              <Checkbox
                className={cs(styles.checkbox)}
                checked={showDiff}
                onChange={() => setShowDiff(!showDiff)}
              >
                Show diff
              </Checkbox>
              )}
              {allowEdit && (
                <Button
                  type="primary"
                  size="small"
                  onClick={() => openEditor(override)}
                  className={cs(styles.edit)}
                >
                  <EditOutlined />
                </Button>
              )}
              {allowApprove && (override?.approved
                ? (
                  <>
                    <Button
                      type="primary"
                      size="small"
                      className={cs(styles.approved)}
                    >
                      <CheckOutlined />
                      {' '}
                      Accepted
                    </Button>
                    <Popconfirm
                      overlayStyle={{ zIndex: 9999 }}
                      title="Are you sure to remove approval for this text?"
                      onConfirm={() => disapproveTextOverride(userReport.campaignId, override.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="primary" size="small" className={cs(styles.discard)}>
                        <CloseOutlined />
                      </Button>
                    </Popconfirm>
                  </>
                )
                : (
                  <Button
                    type="primary"
                    size="small"
                    className={cs(styles.approve)}
                    disabled={approvingInProgress}
                    onClick={() => approve(module, override)}
                  >
                    <CheckOutlined />
                  </Button>
                ))}
              {allowEdit && override && (
                <Popconfirm
                  overlayStyle={{ zIndex: 9999 }}
                  title="Are you sure to discard this text?"
                  onConfirm={() => removeTextOverride(userReport.campaignId, override.id, userReport.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="primary" size="small" className={cs(styles.discard)}>
                    <CloseOutlined />
                  </Button>
                </Popconfirm>
              )}
            </>
          )}
      </div>
    </div>
  )
}

export const Override = connector(OverrideComponent)

export const ModuleOverrides = ({
  moduleOverrides, rstore, pages, allowEdit, allowApprove,
}) => {
  const modules = _.reduce(pages, (list, page) => [...list, ..._.reduce(page.modules.list, (mlist, module) => {
    if (module.type === 'Text' && module.props.editable) {
      return [...mlist, module]
    }
    return mlist
  }, [])], [])

  return modules.map((module) => {
    const override = _.find(moduleOverrides, override => override.moduleId === module.id)
    return (
      <Override
        module={module}
        override={override}
        rstore={rstore}
        allowEdit={allowEdit}
        allowApprove={allowApprove}
      />
    )
  })
}
