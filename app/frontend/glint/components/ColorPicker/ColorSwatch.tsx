import { FC, MouseEventHandler } from 'react'
import cs from 'classnames'
import { RgbaColor } from 'react-colorful'
import { hexToRgba } from '~/utils/color'
import styles from './colorSwatch.less'

type props={
  colors:string[]
  onClick: (color: string) => void
  title?: string
  maxColors?: number
}

export const ColorSwatch:FC<props> = ({
  colors, onClick, title, maxColors,
}) => {
  const handleSwatchClick = ({ target }) => {
    if (colors.includes(target.id)) {
      onClick(target.id)
    }
  }

  if (!colors.length || maxColors === 0) {
    return null
  }

  return (
    <>
      {title || null}
      <div className={styles.swatchContainer} onClick={handleSwatchClick}>
        {
          colors.slice(0, maxColors || colors.length).map(color => (
            <ColorSwatchItem key={color} color={color} />
          ))
        }
      </div>
    </>

  )
}

type ColorSwatchItemProps = {
  color: string
  onClick? : MouseEventHandler<HTMLButtonElement>
  className?: string
}

export const ColorSwatchItem:FC<ColorSwatchItemProps> = ({
  color,
  onClick,
  className,
}) => {
  let colorObj: RgbaColor
  let backgroundColor = color
  if (typeof color === 'string') {
    colorObj = hexToRgba(color)
    backgroundColor = `rgba(${colorObj.r},${colorObj.g},${colorObj.b},${colorObj.a})`
  }
  return (
    <button
      onClick={onClick || (() => null)}
      id={color}
      key={backgroundColor}
      style={{ background: backgroundColor }}
      className={cs([styles.swatchItem, className])}
    />
  )
}
