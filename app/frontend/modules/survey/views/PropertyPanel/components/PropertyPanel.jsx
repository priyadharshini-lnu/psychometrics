import { useEffect, useRef, useState } from 'react'
import _ from 'lodash'
import {
  Divider, Checkbox, Space, ConfigProvider, Alert, Popover,
  Flex, Button,
} from 'antd'
import {
  CloseOutlined,
} from '@ant-design/icons'
import Action from '~/modules/survey/undo'
import LogicElement from '~/modules/survey/models/logic/LogicElement'
import Question from '~/modules/survey/models/Question'
import QuestionSerializer from '~/modules/survey/models/QuestionSerializer'
import Menu from '~/modules/survey/components/ModulesMenu'
import { Properties } from '~/modules/survey/components/modules'
import styles from './PropertyPanel.less'

const QUESTION_BLOCK_BOTTOM_MARGIN = 20
const QUESTION_BLOCK_BOTTOM_PADDING = 15
const QUESTION_BLOCK_BOTTOM_OFFSET = QUESTION_BLOCK_BOTTOM_MARGIN + QUESTION_BLOCK_BOTTOM_PADDING

const PropertyPanelComponent = (props) => {
  const {
    question, offset, addPageBreak, addSkipLogic, copyQuestion, restricted,
    openDisplayLogic, changeType, openPreview, firstBlockContentOffset, unselectQuestion,
    allowChange, blocks,
  } = props
  const panelRef = useRef(null)
  const [showMenu, setShowMenu] = useState(false)
  const [isOverflown, setIsOverflown] = useState(false)
  const style = {
    top: isOverflown ? 'unset' : offset,
    visibility: question ? 'visible' : 'hidden',
    bottom: isOverflown ? 0 : 'unset',
  }
  const serializedQuestion = QuestionSerializer.wrap(question)
  const { allowContentCopy } = serializedQuestion.props
  const View = Properties[`${serializedQuestion.type}Properties`]

  useEffect(() => {
    const htmlElement = document.getElementsByTagName('html')[0]
    const panelHeight = panelRef.current?.scrollHeight
    if (panelHeight) {
      const panelHeightWithOffset = panelHeight + offset
      const questionContentHeight = htmlElement.scrollHeight - firstBlockContentOffset - QUESTION_BLOCK_BOTTOM_OFFSET
      panelHeightWithOffset > questionContentHeight ? setIsOverflown(true) : setIsOverflown(false)
    }
  }, [question, panelRef.current?.scrollHeight])

  const changeQuestionType = (type, props = {}) => {
    if (question.type === type && _.isEmpty(props)) { return }
    Action('QuestionChangeType', question, { oldType: question.type, newType: type })
    changeType(question, type, props)
    setShowMenu(false)
  }

  const questiontypeBtn = (
    <div className={styles.fieldset} style={{ position: 'relative' }}>
      <Flex justify="space-between" align="center">
        <span className={styles.label}>Change Question Type</span>
        <Button shape="circle" type="text" onClick={unselectQuestion} icon={<CloseOutlined />} />
      </Flex>
      {allowChange || question.isNew ? (
        <>
          <Popover
            overlayInnerStyle={{ padding: 0 }}
            trigger="click"
            placement="leftBottom"
            open={showMenu}
            onClick={() => setShowMenu(true)}
            onOpenChange={() => setShowMenu(false)}
            content={<Menu onSelect={changeQuestionType} />}
          >
            <Button
              type="primary"
              size="large"
              className={`${styles.menuButton}`}
            >
              <span className={`fa fa-${serializedQuestion.moduleConfig.icon} ${styles.icon}`} />
              <span
                title={serializedQuestion.moduleConfig.moduleName}
                className={styles.questionType}
              >
                {serializedQuestion.moduleConfig.moduleName}
              </span>
              <span className="caret" />
            </Button>
          </Popover>

        </>
      ) : (
        <Alert
          className={styles.alert}
          type="warning"
          message={I18n.t('administration.survey_builder.property_panel.cant_change_type')}
        />
      )}
    </div>
  )

  const defaultAction = (
    <div className={styles.fieldset}>
      {!restricted && (
        <>
          {
            blocks[question.block_id].props.randomization.type !== 'QuestionsPerPage' ? (
              <a
                onClick={() => addPageBreak(question, new Question({ name: 'PB', type: 'PageBreak' }))}
                className={styles.menuitem}
              >
                <span className={`fa fa-file-o ${styles.icon}`} />
                <span>Add Page Break</span>
              </a>
            ) : null
          }
          <a
            onClick={() => openDisplayLogic({ question, logicElement: question.displayLogic || new LogicElement() })}
            className={styles.menuitem}
          >
            <span className={`fa fa-eye ${styles.icon}`} />
            <span>Add Display Logic</span>
          </a>
          <a onClick={() => addSkipLogic(question)} className={styles.menuitem}>
            <span className={`fa fa-eye-slash  ${styles.icon}`} />
            <span>Add Skip Logic</span>
          </a>
          <a
            onClick={() => {
              const newQuestionParams = _.extend({}, _.cloneDeep(question), { id: null })
              const newQuestion = new Question(newQuestionParams)
              copyQuestion(question, newQuestion)
            }}
            className={styles.menuitem}
          >
            <span className={`fa fa-check-circle-o ${styles.icon}`} />
            <span>Copy Question</span>
          </a>
        </>
      )}
      <a onClick={() => openPreview({ question })} className={styles.menuitem}>
        <span className={`icon fa fa-search ${styles.icon}`} />
        <span>Preview Question</span>
      </a>
    </div>
  )

  const customProperties = View ? <View model={serializedQuestion} restricted={restricted} /> : null

  const commonProperties = (
    <div className={styles.fieldset}>
      <Checkbox
        onChange={({ target: { checked } }) => serializedQuestion.changeProps({ allowContentCopy: checked })}
        defaultChecked={allowContentCopy}
      >
        {I18n.t('administration.survey_builder.property_panel.allow_content_copy')}
      </Checkbox>
    </div>
  )

  return (
    <ConfigProvider componentSize="small">
      <div className={styles.main} style={style}>
        <Space
          className={styles.innerContent}
          key={serializedQuestion.id}
          direction="vertical"
          split={<Divider style={{ margin: 0 }} />}
          size={1}
          ref={panelRef}
          wrap={false}
        >
          {questiontypeBtn}
          {customProperties}
          {commonProperties}
          {defaultAction}
        </Space>
      </div>
    </ConfigProvider>
  )
}

const PropertyPanel = (props) => {
  const { question } = props

  return question ? <PropertyPanelComponent {...props} /> : null
}

export default PropertyPanel
