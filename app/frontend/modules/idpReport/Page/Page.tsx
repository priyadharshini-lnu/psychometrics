import styles from './Page.less'

const Page = ({ rtl, children }) => (
  <div className={`${styles.page} ${rtl ? styles.rtl : ''}`}>
    {children}
  </div>
)

export default Page
