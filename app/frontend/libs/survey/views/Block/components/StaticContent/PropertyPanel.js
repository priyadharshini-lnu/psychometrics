import React from 'react'
import ColorPicker from 'components/ColorPicker'
import { Input } from 'antd'
import styles from './StaticContent.scss'
import settings from './settings'

export default function PropertyPanel ({
  model,
  model: {
    props: {
      staticContent,
      staticContent: {
        backgroundColor, backgroundImageOptions, layout, backgroundImage,
      },
    },
  },
  updateBlockProps,
}) {
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

  const changeColor = (e) => {
    updateBlockProps(model, {
      staticContent: { ...staticContent, backgroundColor: e.hex },
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
          onComplete={changeColor}
          color={backgroundColor || '#fff'}
        />
        <span className={`icon fa fa-trash ${styles.menuicon}`} onClick={() => changeColor({ hex: null })} />
      </div>
      <hr className={styles.divider} />
      <div>
        <div className={styles.label}>Background Image URL:</div>
        <Input
          value={backgroundImage}
          size="small"
          onChange={changeImageUrl}
        />
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
    </div>
  )
}
