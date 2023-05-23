import { FC, useState } from 'react'
import {
  Popover, Space, Button, message,
} from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import { HexAlphaColorPicker, HexColorInput, RgbaColor } from 'react-colorful'
import useEyeDropper from 'use-eye-dropper'
import cs from 'classnames'

import { useLocalStorage } from '~/hooks/useLocalStorage'
import useCopyToClipboard from '~/hooks/useCopyToClipboard'
import { ColorSwatch, ColorSwatchItem } from './ColorSwatch'
import { hexToRgba } from '~/utils/color'
import { EyeDropperIcon } from '~/glint/icons'

import styles from './colorPicker.less'

type props = {
  color: string
  onChange: (color: RgbaColor) => void
  recommendedColors?: string[]
  className?: string
}

const RECENT = 'recentColors'
const MAX_COLORS = 9
const { I18n } = window

export const ColorPicker: FC<props> = ({
  color, onChange, recommendedColors, className,
}) => {
  const [pickedColorHex, setPickedColorHex] = useState<string>(color)
  const [isOpen, setPopoverOpen] = useState(false)
  const [recentColors, updateRecentColors] = useLocalStorage<string[]>(RECENT, [])
  const [, copyValue] = useCopyToClipboard()
  const { open: openEyeDropper, isSupported: eyeDroppeSupported } = useEyeDropper()

  let updatedRecentColors = [...recentColors]

  const handleChange = (color: string) => {
    setPickedColorHex(color)
    onChange(hexToRgba(color))
  }
  const handlePopover = (open: boolean) => {
    setPopoverOpen(open)
    if (!open) {
      onChange(hexToRgba(pickedColorHex))
      const pickedColorAlreadyExistInStorage = recentColors.includes(pickedColorHex)
      if (pickedColorAlreadyExistInStorage) {
        updatedRecentColors = recentColors.filter(color => color !== pickedColorHex)
      }
      updateRecentColors(([pickedColorHex, ...updatedRecentColors]))
    }
  }

  const handleColorInputChange = (color: string) => {
    setPickedColorHex(color)
  }

  const handleInputBlur = () => {
    setPickedColorHex(pickedColorHex)
  }
  const handleCopyButtonClick = () => {
    copyValue(pickedColorHex).then(() => {
      message.success({
        content: I18n.t('glint.color_picker.copy_success_msg'),
        style: {
          position: 'relative',
          top: '24px',
        },
      })
    })
  }

  const pickColor = () => {
    openEyeDropper()
      .then(color => setPickedColorHex(color.sRGBHex))
      .catch((e) => {
        console.warn(e)
      })
  }

  return (
    <div className={cs([styles.pickerContainer, className])}>
      <Popover
        content={(
          <Space direction="vertical" size="middle">
            <HexAlphaColorPicker className={styles.colorPicker} color={pickedColorHex} onChange={handleChange} />
            <div className={styles.inputContainer}>
              {eyeDroppeSupported()
                ? <Button className={styles.eyeDropperButton} icon={<EyeDropperIcon />} onClick={pickColor} /> : null}
              <HexColorInput
                alpha
                color={pickedColorHex}
                onChange={handleColorInputChange}
                onBlur={handleInputBlur}
                className={cs([styles.colorInput, 'ant-input'])}
              />
              <Button icon={<CopyOutlined />} onClick={handleCopyButtonClick} className={styles.copyButton} />
            </div>
            <Space direction="vertical">
              {recommendedColors && recommendedColors.length
                ? (
                  <ColorSwatch
                    title={I18n.t('glint.color_picker.recommended_colors')}
                    colors={recommendedColors}
                    onClick={handleChange}
                    maxColors={MAX_COLORS}
                  />
                ) : null}
              {updatedRecentColors.length
                ? (
                  <ColorSwatch
                    title={I18n.t('glint.color_picker.recent_colors')}
                    colors={updatedRecentColors}
                    onClick={handleChange}
                    maxColors={MAX_COLORS}
                  />
                ) : null}
            </Space>
          </Space>
)}
        className={styles.modal}
        trigger="click"
        visible={isOpen}
        onVisibleChange={handlePopover}
        placement="bottomLeft"
        arrowPointAtCenter
      >
        <ColorSwatchItem
          color={pickedColorHex}
          onClick={() => setPopoverOpen(true)}
        />
      </Popover>
    </div>
  )
}
