import { Avatar } from 'antd'
import cs from 'classnames'
import logo from '~/assets/lighthouseLogoTall.png'
import logoSmall from '~/assets/TTE_Logo_Color_Monogram.png'
import { shortify } from '~/utils/string'
import styles from './UserAvatar.less'

export const UserAvatar = ({ currentUser, collapsed }) => (
  <>
    <div className={cs(styles.logo, { [styles.small]: collapsed })}>
      <img src={collapsed ? logoSmall : logo} />
    </div>
    <a href="/admin/profile/details">
      <div className={styles.userName}>
        {collapsed ? (
          <Avatar alt={currentUser.name}>
            {shortify(currentUser.name)}
          </Avatar>
        ) : currentUser.name}
      </div>
    </a>
    <div className={styles.role}>{currentUser.roleTitle}</div>
  </>
)
