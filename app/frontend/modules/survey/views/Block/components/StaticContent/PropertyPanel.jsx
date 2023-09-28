import { Input, Checkbox } from 'antd'
import { ColorPicker } from '~/glint'

import styles from './StaticContent.less'
import settings from './settings'

const { I18n } = window

const PropertyPanel = ({
  model,
  model: {
    props: {
      staticContent,
      staticContent: {
        backgroundColor,
        backgroundImageOptions,
        layout,
        backgroundImage,
        allowContentCopy,
      },
    },
  },
  updateBlockProps,
}) => {
  const changeLayout = ({ target: { value } }) => {
    updateBlockProps(model, {
      staticContent: { ...staticContent, layout: value },
    })
  }

  const changeImageOptions = ({ target: { value } }) => {
    updateBlockProps(model, {
      staticContent: { ...staticContent, backgroundImageOptions: value },
    })
  }

  const changeImageUrl = ({ target: { value } }) => {
    updateBlockProps(model, {
      staticContent: { ...staticContent, backgroundImage: value },
    })
  }

  const changeColor = (color) => {
    updateBlockProps(model, {
      staticContent: { ...staticContent, backgroundColor: color },
    })
  }

  const handleOnAllowCopy = ({ target: { checked } }) => {
    updateBlockProps(model, {
      staticContent: { ...staticContent, allowContentCopy: checked },
    })
  }

  return (
    <div className={styles.layoutPanel}>
      <div>
        <div className={styles.label}>Layout:</div>
        {settings.layouts.map(({ value, label }) => (
          <label key={value} className={styles.inputLabel}>
            <input
              checked={layout === value}
              type="radio"
              onChange={changeLayout}
              value={value}
            />
            {label}
          </label>
        ))}
      </div>
      <hr className={styles.divider} />
      <div className={styles.colorPicker}>
        <div className={styles.label}>Background Color: </div>
        <ColorPicker
          swatchClassName="ms-1"
          getValueInHexFormat
          onChange={changeColor}
          value={backgroundColor || '#fff'}
        />
        <span
          className={`icon fa fa-trash ${styles.menuicon}`}
          onClick={() => changeColor(null)}
        />
      </div>
      <hr className={styles.divider} />
      <div>
        <div className={styles.label}>Background Image URL:</div>
        <Input value={backgroundImage} size="small" onChange={changeImageUrl} />
      </div>
      <hr className={styles.divider} />
      <div>
        <div className={styles.label}>Background Image Options:</div>
        {settings.imageOptions.map(({ value, label }) => (
          <label key={value} className={styles.inputLabel}>
            <input
              checked={backgroundImageOptions === value}
              type="radio"
              onChange={changeImageOptions}
              value={value}
            />
            {label}
          </label>
        ))}
      </div>
      <hr className={styles.divider} />
      <Checkbox onChange={handleOnAllowCopy} defaultChecked={allowContentCopy}>
        {I18n.t('administration.survey_builder.property_panel.allow_content_copy')}
      </Checkbox>
    </div>
  )
}

export default PropertyPanel
