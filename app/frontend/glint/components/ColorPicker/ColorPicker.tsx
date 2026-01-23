import { FC, useEffect, useState } from 'react'
import {
  Popover, Space, Button, App,
} from 'antd'
import { TooltipPlacement } from 'antd/lib/tooltip'
import { HexAlphaColorPicker, HexColorInput, RgbaColor } from 'react-colorful'
import useEyeDropper from 'use-eye-dropper'
import cs from 'classnames'
import { CopyOutlined, DeleteOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import { useLocalStorage } from '~/hooks/useLocalStorage'
import useCopyToClipboard from '~/hooks/useCopyToClipboard'
import { ColorSwatch, ColorSwatchItem } from './ColorSwatch'
import { hexToRgba } from '~/utils/color'
import { EyeDropperIcon } from '~/glint/icons'

import styles from './colorPicker.less'

type props = {
  defaultColor?: string
  onChange?: (color: RgbaColor|string) => void
  value?: string
  recommendedColors?: string[]
  swatchClassName?: string
  getValueInHexFormat?: boolean
  colorPickerPosition?: TooltipPlacement
  onClear?: () => void
}

const RECENT = 'recentColors'
const MAX_COLORS = 9
const { I18n } = window

export const ColorPicker: FC<props> = ({
  defaultColor, onChange, recommendedColors, swatchClassName, getValueInHexFormat, value, colorPickerPosition, onClear,
}) => {
  const [pickedColorHex, setPickedColor] = useState<string>('')
  const [isOpen, setPopoverOpen] = useState(false)
  const [recentColors, updateRecentColors] = useLocalStorage<string[]>(RECENT, [])
  const [, copyValue] = useCopyToClipboard()
  const { open: openEyeDropper, isSupported: eyeDroppeSupported } = useEyeDropper()
  let updatedRecentColors = [...recentColors]
  const { message } = App.useApp()

  useEffect(() => {
    setPickedColor(value || defaultColor || '')
  }, [value])

  const handleColorChange = (color: string) => {
    setPickedColor(color)
  }
  const handlePopover = (open: boolean) => {
    setPopoverOpen(open)
    if (!open) {
      onChange && onChange(getValueInHexFormat ? pickedColorHex : hexToRgba(pickedColorHex))
      const pickedColorAlreadyExistInStorage = recentColors.includes(pickedColorHex)
      if (pickedColorAlreadyExistInStorage) {
        updatedRecentColors = recentColors.filter(color => color !== pickedColorHex)
      }
      updateRecentColors(([pickedColorHex, ...updatedRecentColors]))
    }
  }

  const handleColorInputChange = (color: string) => {
    handleColorChange(color)
  }

  const handleInputBlur = () => {
    handleColorChange(pickedColorHex)
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
      .then(color => handleColorChange(color.sRGBHex))
      .catch((e) => {
        console.warn(e)
      })
  }

  return (
    <div className={swatchClassName}>
      <Space>
        <Popover
          content={(
            <Space direction="vertical" size="middle">
              <HexAlphaColorPicker className={styles.colorPicker} color={pickedColorHex} onChange={handleColorChange} />
              <div className={styles.inputContainer}>
                {eyeDroppeSupported()
                  ? (
                    <Button
                      type="text"
                      className={styles.eyeDropperButton}
                      icon={<EyeDropperIcon />}
                      onClick={pickColor}
                    />
                  ) : null}
                <HexColorInput
                  alpha
                  color={pickedColorHex}
                  onChange={handleColorInputChange}
                  onBlur={handleInputBlur}
                  className={cs([styles.colorInput, 'ant-input'])}
                  data-testid="color-input"
                />
                <Button
                  type="text"
                  icon={<CopyOutlined />}
                  onClick={handleCopyButtonClick}
                  className={styles.copyButton}
                />
              </div>
              <Space direction="vertical">
                {recommendedColors && recommendedColors.length
                  ? (
                    <ColorSwatch
                      title={I18n.t('glint.color_picker.recommended_colors')}
                      colors={recommendedColors}
                      onClick={handleColorChange}
                      maxColors={MAX_COLORS}
                      dataTestid="recommendedColors"
                    />
                  ) : null}
                {updatedRecentColors.length
                  ? (
                    <ColorSwatch
                      title={I18n.t('glint.color_picker.recent_colors')}
                      colors={updatedRecentColors}
                      onClick={handleColorChange}
                      maxColors={MAX_COLORS}
                      dataTestid="recentlyUsedColors"
                    />
                  ) : null}
              </Space>
            </Space>
        )}
          trigger="click"
          open={isOpen}
          onOpenChange={handlePopover}
          placement={colorPickerPosition && colorPickerPosition}
          arrow={{ pointAtCenter: true }}
          classNames={{
            root: styles.popover,
          }}
        >
          <span>
            <ColorSwatchItem
              color={pickedColorHex}
              className={swatchClassName}
            />
          </span>
        </Popover>
        {value && onClear && <Button type="link" size="small" danger onClick={onClear} icon={<DeleteOutlined />} /> }
      </Space>
    </div>
  )
}
