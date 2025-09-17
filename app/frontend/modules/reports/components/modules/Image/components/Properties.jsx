import { useRef, useEffect } from 'react'
import Select from 'react-select'
import { Space, InputNumber, Select as AntSelect } from 'antd'
import { LibraryStore } from '~/libs/library'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import LibraryTransport from '~/modules/reports/cable/LibraryChannel'
import Socket from '~/modules/reports/cable'
import I18nStore from '~/modules/reports/store/I18nStore'
import AssessmentProperties from '~/modules/reports/components/modules/CommonProperties/AssessmentProperties'
import clearAfterAssessmentChange from '~/modules/reports/components/modules/CommonMethods/clearAfterAssessmentChange'
import { getValue } from '~/modules/reports/presenters/ReactSelectPresenter'
import { rgba2hex } from '~/utils/color'
import ChoicesInput from '~/modules/reports/components/ChoicesInput'
import { ColorPicker } from '~/glint'
import QuestionsSelect from './QuestionsSelect'
import connect from '../connect'

const TYPE_OPTIONS = [
  { label: 'Simple Image', value: 'SimpleImage' },
  { label: 'Conditional Image', value: 'ConditionalImage' },
  { label: 'Uploaded Image', value: 'ResponseImage' },
  { label: 'User Profile Image', value: 'UserProfileImage' },
]

const Properties = ({
  modules, questions, openConditionalImage, pageSize,
}) => {
  const model = modules[0]
  const updateAll = (cb) => {
    modules.forEach((module) => {
      cb?.(module)
      module.update()
    })
  }

  const librarySocket = useRef(null)

  useEffect(() => {
    LibraryTransport.init()
    librarySocket.current = Socket.library()
  }, [])

  const onSelectGraphic = (item) => {
    updateAll((model) => {
      model.props.url = item.file
    })
  }

  const changeBorderColor = (color) => {
    updateAll((model) => {
      model.props.style.borderColor = color
    })
  }

  const changeBorderRadius = (val) => {
    updateAll((model) => {
      model.props.style.borderRadius = val
    })
  }

  const changeBorderWidth = (val) => {
    updateAll((model) => {
      model.props.style.borderWidth = val
    })
  }

  const changeBorderStyle = (val) => {
    updateAll((model) => {
      model.props.style.borderStyle = val
    })
  }

  const changeUrl = (e) => {
    updateAll((model) => {
      const val = e.currentTarget.value
      model.props.url = val
    })
  }

  const changeBorder = (e) => {
    updateAll((model) => {
      const val = e.currentTarget.checked
      model.props.border = val
      if (val) {
        model.props.style = model.props.style ? model.props.style : { style: 'solid' }
      }
    })
  }

  const changeAspectRatio = (e) => {
    updateAll((model) => {
      const val = e.currentTarget.checked
      model.props.aspectRatio = val
    })
  }

  const flipImageForOtherDirectionLang = (e) => {
    updateAll((model) => {
      const val = e.currentTarget.checked
      model.props.flipImageForOtherDirectionLang = val
    })
  }

  const openLibrary = () => {
    LibraryStore.openPopup(librarySocket.current, onSelectGraphic, 'image')
  }

  const update = () => {
    updateAll()
  }

  const changeSourceType = (obj) => {
    updateAll((model) => {
      model.props.sourceType = obj.value
      if (model.props.sourceType === 'ConditionalImage') {
        model.props.url = null
      }
    })
  }

  const openConditionModal = () => {
    openConditionalImage({ modules })
  }

  const changeAssessment = (assessmentId) => {
    updateAll((model) => {
      model.assessment_id = assessmentId
      clearAfterAssessmentChange(model)
    })
  }

  const expand = () => {
    updateAll((model) => {
      model.props.position.left = 0
      model.props.position.top = 0
      model.props.position.width = pageSize.width
      model.props.position.height = pageSize.height
    })
  }

  const {
    borderRadius, borderColor = {}, borderWidth, borderStyle,
  } = (model.props.style || {})

  return (
    <div>
      <div className={styles.title}>Image Options</div>
      <AssessmentProperties assessmentId={model.assessment_id} changeAssessment={changeAssessment} />
      <hr className={styles.divider} />
      <div className="margin-top-10 margin-bottom-10">
        <Select
          name="form-field-name"
          value={getValue(TYPE_OPTIONS, model.props.sourceType)}
          options={TYPE_OPTIONS}
          getOptionValue={opt => opt.value}
          autoFocus={false}
          clearable={false}
          onChange={changeSourceType}
        />
        {model.props.sourceType === 'ConditionalImage' && (
          <div
            style={{ width: '100%' }}
            onClick={openConditionModal}
            className="btn btn-default"
          >
            Manage condition
          </div>
        )}
        {model.props.sourceType === 'SimpleImage' && (
          <div>
            <div className={styles.block}>
              <a onClick={openLibrary} className={styles.text}>Choose Image</a>
            </div>
            <div className={styles.block}>
              <label className={styles.inputLabel}>
                Url
              </label>
              <input value={I18nStore.tModule(model, 'imageUrl') || model.props.url} onChange={changeUrl} />
            </div>
          </div>
        )}
        {model.props.sourceType === 'ResponseImage' && (
          <div>
            <div className={styles.block}>
              <QuestionsSelect questions={questions} model={model} onSelect={update} />
            </div>
          </div>
        )}
        <div className={styles.block}>
          <button className="btn btn-default" onClick={expand}>Expand to page sizes</button>
        </div>
      </div>
      <div className={styles.block} style={{ position: 'relative' }}>
        <label className={styles.inputLabel}>
          <input
            style={{ marginRight: '5px' }}
            type="checkbox"
            checked={model.props.flipImageForOtherDirectionLang || false}
            onChange={flipImageForOtherDirectionLang}
          />
          <span>Flip Image for Other Direction Language(ltr/rtl)</span>
        </label>
      </div>
      <div className={styles.block} style={{ position: 'relative' }}>
        <label className={styles.inputLabel}>
          <input
            style={{ marginRight: '5px' }}
            type="checkbox"
            checked={model.props.aspectRatio}
            onChange={changeAspectRatio}
          />
          Resize with Aspect Ratio
        </label>
      </div>
      <hr className={styles.divider} />
      <div className={styles.block} style={{ position: 'relative' }}>
        <label className={styles.inputLabel}>
          <input
            style={{ marginRight: '5px' }}
            type="checkbox"
            checked={model.props.border}
            onChange={changeBorder}
          />
          Border
        </label>
      </div>
      {model.props.border && (
        <>
          <Space.Compact block>
            <div className={styles.inline}>
              <label>Width</label>
              <InputNumber value={borderWidth || 0} min={0} onChange={changeBorderWidth} max={100} />
            </div>
            <div className={styles.inline}>
              <label>Style</label>
              <AntSelect
                style={{ width: '100%' }}
                onChange={changeBorderStyle}
                value={borderStyle}
                options={[
                  { value: 'solid' },
                  { value: 'dashed' },
                  { value: 'dotted' },
                  { value: 'double' },
                  { value: 'groove' },
                  { value: 'ridge' },
                  { value: 'inset' },
                  { value: 'outset' },
                ]}
              />
            </div>
          </Space.Compact>
          <div className={styles.block} style={{ position: 'relative' }}>
            <ColorPicker value={rgba2hex(borderColor)} onChange={changeBorderColor} />
            Border Color
          </div>
        </>
      )}

      <div className={styles.block}>
        Rounded Corners
        <ChoicesInput value={borderRadius || 0} onChange={changeBorderRadius} maxValue={1000} />
      </div>
      <hr className={styles.divider} />
    </div>
  )
}

export default connect(Properties)
