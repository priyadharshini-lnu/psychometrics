import styles from './Header.less'

const Header = ({ name }) => (
  <div className={`panel-heading ${styles.menu}`}>
    <div>
      <h3 className="panel-title">
        Assessment
        {name}
      </h3>
    </div>
  </div>
)

export default Header
