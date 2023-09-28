import cs from 'classnames'
import { Header, UnstyledLi } from '../shared'
import styles from './styles.less'
import commonStyles from '../../../Text.less'

export default function BulletedList ({
  values,
  update,
  descriptionList,
  model,
  model: {
    props: {
      styled,
      showHeader,
      showDescription,
    },
  }, preview,
}) {
  return (
    <ul className={cs({ [commonStyles.styledList]: styled })}>
      {showHeader && <Header update={update} model={model} preview={preview} />}
      {values.map((v, i) => (
        styled
          ? (
            <StyledLi key={i} text={v} description={showDescription && descriptionList[i]} />
          )
          : <UnstyledLi key={i} text={v} description={showDescription && descriptionList[i]} />
      ))}
    </ul>
  )
}

const StyledLi = ({ text, description }) => (
  <li>
    <div className={styles.bullet}>
      <span>●</span>
    </div>
    <div className={styles.text}>
      <div>{text}</div>
      {description && <div className={styles.description}>{description}</div>}
    </div>
  </li>
)
