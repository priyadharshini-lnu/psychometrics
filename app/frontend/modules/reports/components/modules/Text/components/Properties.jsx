import _ from 'lodash'
import { Button, Space } from 'antd'
import Select from 'react-select'
import cs from 'classnames'
import { DeleteOutlined, ClearOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import { ColorPicker } from '~/glint'
import PropertyFonts, { styleClassess, getStyle } from '~/modules/reports/components/PropertyFonts'
import ChoicesInput from '~/modules/reports/components/ChoicesInput'
import AssessmentProperties from '~/modules/reports/components/modules/CommonProperties/AssessmentProperties'
import clearAfterAssessmentChange from '~/modules/reports/components/modules/CommonMethods/clearAfterAssessmentChange'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import localStyles from './Properties.less'
import ResponseText from './SourceTypeForms/ResponseText'
import ResultText from './SourceTypeForms/ResultText'
import AIContent from './SourceTypeForms/AIContent'
import AIRationaleEvidence from './SourceTypeForms/AIRationaleEvidence'
import AITranscript from './SourceTypeForms/AITranscript'
import connect from '../connect'
import { rgba2hex } from '~/utils/color'
import DefaultProps from '~/modules/reports/consts/DefaultProps'
import { isAiAssistantEnabled, isEnhanceWithAiEnabled } from '~/modules/reports/utils/features'

const SELECT_OPTIONS = [
  { label: 'Text', value: 'Text' },
  { label: 'PipedText', value: 'PipedText' },
  { label: 'ConditionalText', value: 'ConditionalText' },
  { label: 'Conditional Subfactor / Occupation Text', value: 'ConditionalFactorOccupationText' },
  { label: 'Response Text', value: 'ResponseText' },
  { label: 'Result/DataSheet Text', value: 'ResultText' },
  isAiAssistantEnabled() && { label: 'AI Content', value: 'AIContent' },
  isAiAssistantEnabled() && { label: 'AI Rationale & Evidence', value: 'AIRationaleEvidence' },
  isAiAssistantEnabled() && { label: 'AI Transcript', value: 'AITranscript' },
].filter(Boolean)

const Properties = ({
  modules, reportStyles, openConditionalText, openConditionalFactorOccupationText, questions,
}) => {
  const model = modules[0]

  const update = () => {
    updateAll()
  }

  const updateAll = (cb) => {
    modules.forEach((module) => {
      cb?.(module)
      module.update()
    })
  }

  const changeBg = (color) => {
    updateAll((model) => {
      model.props.style.backgroundColor = color
    })
  }

  const changeBorder = (color) => {
    updateAll((model) => {
      model.props.style.borderColor = color
    })
  }

  const changeHorizontalAlign = (type) => {
    updateAll((model) => {
      if (model.props.style.horizontalAlign === type) {
        model.props.style.horizontalAlign = ''
      } else {
        model.props.style.horizontalAlign = type
      }
    })
  }

  const changeVerticalAlign = (type) => {
    updateAll((model) => {
      if (model.props.style.verticalAlign === type) {
        model.props.style.verticalAlign = ''
      } else {
        model.props.style.verticalAlign = type
      }
    })
  }

  const changeFontWeight = (e) => {
    updateAll((model) => {
      model.props.style.fontWeight = e.currentTarget.checked ? 'bold' : 'normal'
    })
  }

  const changeFontStyle = (e) => {
    updateAll((model) => {
      model.props.style.fontStyle = e.currentTarget.checked ? 'italic' : 'normal'
    })
  }

  const changeBorderRadius = (val) => {
    updateAll((model) => {
      model.props.style.borderRadius = val
    })
  }

  const reset = () => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure?')) {
      updateAll((model) => {
        model.reset()
      })
    }
  }

  const removeStyle = (name) => {
    updateAll((model) => {
      model.props.style = _.omit(model.props.style, name)
    })
  }

  const resetStyles = () => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure?')) {
      updateAll((model) => {
        model.props.style = _.cloneDeep(DefaultProps.Text.style)
      })
    }
  }

  const changeSourceType = (obj) => {
    updateAll((model) => {
      model.props.sourceType = obj.value
    })
  }

  const openConditionModal = () => {
    openConditionalText({ modules })
  }

  const openConditionalFactorOccupationModal = () => {
    openConditionalFactorOccupationText({ modules })
  }

  const changeAssessment = (assessmentId) => {
    updateAll((model) => {
      model.assessment_id = assessmentId
      clearAfterAssessmentChange(model)
    })
  }

  const changeEditAndApprove = (e) => {
    updateAll((model) => {
      model.props.editable = e.currentTarget.checked
      model.update()
    })
  }

  const changeAITranslation = (e) => {
    updateAll((model) => {
      model.props.aiTranslationEnabled = e.currentTarget.checked
      model.update()
    })
  }

  const changeEnhanceWithAI = (e) => {
    updateAll((model) => {
      model.props.enhanceWithAIEnabled = e.currentTarget.checked
      model.update()
    })
  }

  const changeHideRationale = (e) => {
    updateAll((model) => {
      model.props.hideRationale = e.currentTarget.checked
      model.update()
    })
  }

  const changeHideEvidence = (e) => {
    updateAll((model) => {
      model.props.hideEvidence = e.currentTarget.checked
      model.update()
    })
  }

  const changeModelIn = (keys, value) => {
    // TODO (atanych): update model by link directly in the component is not good
    // practice. We should avoid mutations in future.
    // TODO (atanych): But for now let's keep as is.
    updateAll((model) => {
      _.set(model, keys, value)
    })
  }

  const changePrecision = (val) => {
    updateAll((model) => {
      model.props.precision = val
    })
  }

  const renderPosition = () => {
    const { verticalAlign } = model.props.style
    const { horizontalAlign } = model.props.style

    const textStyles = _.compact((model.props.styleIds || []).map(id => reportStyles[id]))

    const textAlign = getStyle(textStyles, 'textAlign')
    const alignItems = getStyle(textStyles, 'alignItems')

    return (
      <div className={localStyles.containersBox}>
        <div className={localStyles.horizontalContainer}>
          {_.map(['left', 'center', 'right', 'justify'], (type, i) => (
            <div
              key={i}
              onClick={e => changeHorizontalAlign(type, e)}
              className={
                cs(localStyles.alignedBlock, localStyles[type], {
                  [localStyles.active]: horizontalAlign === type,
                }, (horizontalAlign ? horizontalAlign === type : textAlign === type)
                && styleClassess(textStyles, 'textAlign', horizontalAlign))
              }
            />
          ))}
        </div>
        <div className={localStyles.verticalContainer}>
          {_.map(['flex-start', 'center', 'flex-end'], (type, i) => (
            <div
              key={i}
              onClick={e => changeVerticalAlign(type, e)}
              className={
                cs(localStyles.alignedBlock, localStyles[type], {
                  [localStyles.active]: verticalAlign === type,
                }, (verticalAlign ? verticalAlign === type : alignItems === type)
                && styleClassess(textStyles, 'alignItems', verticalAlign))
              }
            />
          ))}
        </div>
      </div>
    )
  }

  // TODO (atanych): should be extracted neighbourhood as dedicated Components according to store.model.props.sourceType
  const renderResponseTextForm = () => {
    if (model.props.sourceType !== 'ResponseText') { return null }
    return (
      <ResponseText model={model} onChangeModelIn={changeModelIn} questions={questions} />
    )
  }

  // TODO (atanych): should be extracted neighbourhood as dedicated Components according to store.model.props.sourceType
  const renderResultTextForm = () => {
    if (model.props.sourceType !== 'ResultText') { return null }
    return (
      <ResultText modules={modules} onChangeModelIn={changeModelIn} update={update} questions={questions} />
    )
  }

  const renderAIContentForm = () => {
    if (model.props.sourceType !== 'AIContent') { return null }
    return (
      <AIContent modules={modules} update={update} />
    )
  }

  const renderAIRationaleEvidenceForm = () => {
    if (model.props.sourceType !== 'AIRationaleEvidence') { return null }
    return (
      <AIRationaleEvidence model={model} onChangeModelIn={changeModelIn} questions={questions} />
    )
  }

  const renderAITranscriptForm = () => {
    if (model.props.sourceType !== 'AITranscript') { return null }
    return (
      <AITranscript model={model} onChangeModelIn={changeModelIn} questions={questions} />
    )
  }

  const renderDataSourceOptions = () => {
    if (model.props.sourceType === 'ResultText' || model.props.sourceType === 'AIContent') return null

    return (
      <div>
        <hr className={styles.divider} />
        <AssessmentProperties assessmentId={model.assessment_id} changeAssessment={changeAssessment} />
      </div>
    )
  }

  const { backgroundColor, borderColor, borderRadius } = model.props.style

  return (
    <div>
      <div className={styles.title}>Text Options</div>
      {renderDataSourceOptions()}
      <hr className={styles.divider} />
      <div className="margin-top-10 margin-bottom-10">
        <Select
          name="form-field-name"
          value={getValue(SELECT_OPTIONS, model.props.sourceType)}
          options={SELECT_OPTIONS}
          getOptionValue={opt => opt.value}
          autoFocus={false}
          isClearable={false}
          onChange={changeSourceType}
        />
        {model.props.sourceType === 'ConditionalText'
          && (
            <div
              style={{ width: '100%' }}
              onClick={openConditionModal}
              className="btn btn-default"
            >
              Manage condition
            </div>
          )}
        {model.props.sourceType === 'ConditionalFactorOccupationText'
          && (
            <div
              style={{ width: '100%' }}
              onClick={openConditionalFactorOccupationModal}
              className="btn btn-default"
            >
              Manage condition
            </div>
          )}
        {renderResponseTextForm()}
        {renderResultTextForm()}
        {renderAIContentForm()}
        {renderAIRationaleEvidenceForm()}
        {renderAITranscriptForm()}
        {
          model.props.sourceType === 'PipedText'
          && (
            <div style={{ width: '100%' }}>
              <div>
                {'{{first_name}}'}
                {' '}
                - First Name
              </div>
              <div>
                {'{{last_name}}'}
                {' '}
                - Last Name
              </div>
              <div>
                {'{{completed_at}}'}
                {' '}
                - Date of completion assessment
              </div>
              <div>
                {'{{norm_used}}'}
                {' '}
                - Norm Used
              </div>
              <div>
                {'{{locale_name}}'}
                {' '}
                - Locale
              </div>
              <br />
              <em>{'Note: {{}} Must only be used with available Piped Text Options'}</em>
            </div>
          )
        }
      </div>
      <hr className={styles.divider} />
      <div className="margin-top-10">Font</div>
      <PropertyFonts modules={modules} model={model} reportStyles={reportStyles} />
      <div className="margin-top-10">Paragraph</div>
      {renderPosition()}
      <div className="margin-top-10">
        <label className={styles.inputLabel}>
          <input
            style={{ marginRight: '5px' }}
            className={cs(styleClassess(reportStyles, 'fontWeight', model.props.style.fontWeight))}
            type="checkbox"
            checked={model.props.style.fontWeight === 'bold'}
            onChange={changeFontWeight}
          />
          Bold
        </label>
        <label className={styles.inputLabel}>
          <input
            style={{ marginRight: '5px' }}
            className={cs(styleClassess(reportStyles, 'fontStyle', model.props.style.fontStyle))}
            type="checkbox"
            checked={model.props.style.fontStyle === 'italic'}
            onChange={changeFontStyle}
          />
          Italics
        </label>
        {model.props.sourceType === 'ResultText' && model.props.source?.type === 'DataSheet' && (
          <div className={styles.block} style={{ position: 'relative' }}>
            <div className="margin-top-10">Number Precision</div>
            <label className={styles.inputLabel}>
              <ChoicesInput
                value={model.props.precision || 0}
                onChange={changePrecision}
                minValue={0}
                maxValue={10}
              />
            </label>
          </div>
        )}
      </div>
      <Button size="small" danger onClick={resetStyles} icon={<ClearOutlined />}>Reset Font Styles</Button>
      <hr className={styles.divider} />
      <div className={styles.block} style={{ position: 'relative' }}>
        <div className="margin-top-10">Content overriding</div>
        <label className={styles.inputLabel}>
          <input
            style={{ marginRight: '5px' }}
            type="checkbox"
            checked={model.props.editable}
            onChange={changeEditAndApprove}
          />
          Edit and Approve
        </label>
        {isEnhanceWithAiEnabled() && (
          <label className={styles.inputLabel}>
            <input
              style={{ marginRight: '5px' }}
              type="checkbox"
              checked={model.props.enhanceWithAIEnabled ?? true}
              onChange={changeEnhanceWithAI}
            />
            Enhance with AI
          </label>
        )}
        <label className={styles.inputLabel}>
          <input
            style={{ marginRight: '5px' }}
            type="checkbox"
            checked={model.props.aiTranslationEnabled ?? false}
            onChange={changeAITranslation}
          />
          {I18n.t('administration.report_builder.property_panel.translate_with_ai')}
        </label>
        {model.props.sourceType === 'AIRationaleEvidence' && (
          <>
            <label className={styles.inputLabel}>
              <input
                style={{ marginRight: '5px' }}
                type="checkbox"
                checked={model.props.hideRationale ?? false}
                onChange={changeHideRationale}
                disabled={model.props.hideEvidence}
              />
              {I18n.t('shared.reports.ai_rationale_evidence.hide_rationale')}
            </label>
            <label className={styles.inputLabel}>
              <input
                style={{ marginRight: '5px' }}
                type="checkbox"
                checked={model.props.hideEvidence ?? false}
                onChange={changeHideEvidence}
                disabled={model.props.hideRationale}
              />
              {I18n.t('shared.reports.ai_rationale_evidence.hide_evidence')}
            </label>
          </>
        )}
      </div>
      <hr className={styles.divider} />
      <div className={styles.block} style={{ position: 'relative' }}>
        Background Color
        <Space.Compact block className={localStyles.flexCenter}>
          <ColorPicker
            swatchClassName={localStyles.swatch}
            value={_.isObject(backgroundColor) ? rgba2hex(backgroundColor) : backgroundColor}
            onChange={changeBg}
          />
          {backgroundColor && (
            <Button
              onClick={() => removeStyle('backgroundColor')}
              size="small"
              type="link"
              danger
              icon={<DeleteOutlined />}
            />
          )}
        </Space.Compact>

      </div>
      <div className={styles.block} style={{ position: 'relative' }}>
        Border Color
        <Space.Compact block className={localStyles.flexCenter}>
          <ColorPicker
            swatchClassName={localStyles.swatch}
            value={_.isObject(borderColor) ? rgba2hex(borderColor) : borderColor}
            onChange={changeBorder}
          />
          {borderColor && (
            <Button
              onClick={() => removeStyle('borderColor')}
              size="small"
              type="link"
              danger
              icon={<DeleteOutlined />}
            />
          )}
        </Space.Compact>

      </div>
      <hr className={styles.divider} />
      <div className={styles.block}>
        Rounded Corners
        <Space>
          <ChoicesInput value={borderRadius || 0} onChange={changeBorderRadius} maxValue={1000} />
          {borderRadius !== undefined && (
            <Button
              onClick={() => removeStyle('borderRadius')}
              size="small"
              type="link"
              danger
              icon={<DeleteOutlined />}
            />
          )}
        </Space>
      </div>
      <hr className={styles.divider} />
      <div className={`${styles.block} ${styles.reset}`} onClick={reset}>
        Reset Text...
      </div>
    </div>
  )
}

export default connect(Properties)
