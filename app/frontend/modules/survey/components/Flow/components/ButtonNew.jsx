import styles from './Flow.less'

const ButtonNew = ({ onClick }) => (
  <div className={`btn btn-default ${styles.newLine}`} onClick={onClick}>
    <span className="fa fa-plus" />
    Add a new Element Here
  </div>
)

export default ButtonNew
