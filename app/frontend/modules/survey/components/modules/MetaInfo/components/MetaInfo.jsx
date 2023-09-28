import styles from './MetaInfo.less'

const MetaInfo = () => (
  <div style={{ position: 'relative' }}>
    <span>
      This question will record the recipient&apos;s browser information. It
      will not be displayed to the user.
    </span>
    <ul className={styles.ul}>
      <li>Browser Type </li>
      <li>Browser Version</li>
      <li>Operating System</li>
      <li>Screen Resolution</li>
      <li>User Agent</li>
    </ul>
  </div>
)

export default MetaInfo
