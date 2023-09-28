import cs from 'classnames'
import { Header, UnstyledLi } from '../shared'
import styles from './styles.less'
import commonStyles from '../../../Text.less'

const NumberedList = ({
  update,
  values,
  descriptionList,
  model,
  model: {
    props: {
      styled,
      showHeader,
      showDescription,
    },
  }, preview,
}) => (
  <ol className={cs({ [commonStyles.styledList]: styled })}>
    {showHeader && <Header update={update} model={model} preview={preview} />}
    {values.map((v, i) => (
      styled
        ? (
          <StyledLi key={i} index={i} text={v} description={showDescription && descriptionList[i]} />
        )
        : <UnstyledLi key={i} text={v} description={showDescription && descriptionList[i]} />
    ))}
  </ol>
)

const StyledLi = ({ text, description, index }) => (
  <li>
    <div className={styles.numberContainer}>
      <span className={styles.number}>{index + 1}</span>
    </div>
    <div className={styles.text}>
      <div>{text}</div>
      {description && <div className={styles.description}>{description}</div>}
    </div>
  </li>
)

export default NumberedList
