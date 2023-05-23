import { FC, MouseEventHandler } from 'react'
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

  if (colors.length || maxColors === 0) {
    return null
  }

  return (
    <>
      {title || null}
      <div className={styles.swatchContainer} onClick={handleSwatchClick}>
        {
          colors.slice(0, maxColors || colors.length).map(color => (
            <ColorSwatchItem color={color} />
          ))
        }
      </div>
    </>

  )
}

type ColorSwatchItemProps = {
  color: string
  onClick? : MouseEventHandler<HTMLButtonElement>
}

export const ColorSwatchItem:FC<ColorSwatchItemProps> = ({
  color,
  onClick,
}) => (
  <button
    onClick={onClick || (() => null)}
    id={color}
    key={color}
    style={{ background: color }}
    className={styles.swatchItem}
  />
)
