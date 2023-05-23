import styles from './styles.less'

export default function FilterAvatar ({ filter, fontSize, showLabel }) {
  const fontSizeStr = `${fontSize}em`
  const heightStr = `${fontSize * 2.6}em`
  const style = {
    backgroundColor: filter.color,
    fontSize: fontSizeStr,
    height: heightStr,
    width: heightStr,
    lineHeight: heightStr,
  }
  if (!showLabel) {
    style.color = '#ffffff00'
  }
  return (
    <div
      className={styles.avatar}
      style={style}
    >
      {filter.avatarLetters}
    </div>
  )
}
