import { Avatar } from 'antd'
import { Link as RouterLink } from 'react-router-dom'
import cs from 'classnames'
import logo from './assets/lighthouseLogoTall.png'
import logoSmall from './assets/TTE_Logo_Color_Monogram.png'
import { shortify } from '~/utils/string'
import styles from './UserAvatar.less'

const { I18n } = window

// TODO: When all pages are implemented in single react App, directly use RouterLink
const Link = ({ href, children, ariaLabel }) => {
  const currentUrl = location.href
  const reactSpaRoutes = [
    'admin/profile', 'admin/clients', 'admin/projects', 'admin/users', 'admin/user_availabilities', 'admin/reports',
  ]
  const renderReactRoute = reactSpaRoutes.find(reactSpaRoute => currentUrl.includes(reactSpaRoute))
  if (renderReactRoute) {
    return <RouterLink aria-label={ariaLabel} to={href}>{children}</RouterLink>
  }
  return <a aria-label={ariaLabel} href={href}>{children}</a>
}


export const UserAvatar = ({ currentUser, collapsed }) => (
  <>
    <div className={cs(styles.logo, { [styles.small]: collapsed })}>
      <Link
        ariaLabel={`${I18n.t('frontend.aria.back_to_dashboard')}`}
        href={currentUser.roleTitle === 'Assessor' ? '/assessors' : '/admin'}
      >
        <img alt="Lighthouse logo" src={collapsed ? logoSmall : logo} />
      </Link>
    </div>
    <div className="ta-c">
      {collapsed ? (
        <a className={styles.userName} href="/admin/profile/details">
          <span className="sr-only">
            {`${I18n.t('administration.navigation.user_profile_details')} - ${currentUser.name}`}
          </span>
          <Avatar alt={currentUser.name}>
            {shortify(currentUser.name)}
          </Avatar>
        </a>
      ) : (
        <a
          className={styles.userName}
          href="/admin/profile/details"
        >
          <span className="sr-only">{I18n.t('administration.navigation.user_profile_details')}</span>
          {currentUser.name}
        </a>
      )}
    </div>
    <div className={styles.role}>{currentUser.roleTitle}</div>
  </>
)
