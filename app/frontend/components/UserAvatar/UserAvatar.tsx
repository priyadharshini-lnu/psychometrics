import { Avatar } from 'antd'
import { Link as RouterLink } from 'react-router-dom'
import cs from 'classnames'
import logo from '~/assets/lighthouseLogoTall.png'
import logoSmall from '~/assets/TTE_Logo_Color_Monogram.png'
import { shortify } from '~/utils/string'
import styles from './UserAvatar.less'

// TODO: When all pages are implemented in single react App, directly use RouterLink
const Link = ({ href, children }) => {
  const currentUrl = location.href
  const reactSpaRoutes = [
    'admin/profile', 'admin/clients', 'admin/projects', 'admin/users', 'admin/user_availabilities', 'admin/reports',
  ]
  const renderReactRoute = reactSpaRoutes.find(reactSpaRoute => currentUrl.includes(reactSpaRoute))
  if (renderReactRoute) {
    return <RouterLink to={href}>{children}</RouterLink>
  }
  return <a href={href}>{children}</a>
}


export const UserAvatar = ({ currentUser, collapsed }) => (
  <>
    <div className={cs(styles.logo, { [styles.small]: collapsed })}>
      <Link href="/admin">
        <img src={collapsed ? logoSmall : logo} />
      </Link>
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
