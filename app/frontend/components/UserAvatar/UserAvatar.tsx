import { Link as RouterLink } from 'react-router-dom'
import cs from 'classnames'
import logo from './assets/lighthouseLogoTall.png'
import logoSmall from './assets/TTE_Logo_Color_Monogram.png'
import styles from './UserAvatar.less'

const { I18n } = window

// TODO: When all pages are implemented in single react App, directly use RouterLink
const Link = ({
  href,
  children,
  ariaLabel,
}) => {
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


export const UserAvatar = ({
  currentUser,
  collapsed,
}) => {
  const customLogo = window.PsyGlobalState?.clientContextData?.logo_url

  // Kept for the sub-navigation, which still renders on a light surface.
  const defaultLogo = collapsed ? logoSmall : logo

  return (
    <>
      <div className={cs(styles.logo, { [styles.small]: collapsed })}>
        <Link
          ariaLabel={`${I18n.t('frontend.aria.back_to_dashboard')}`}
          href={currentUser.roleTitle === 'Assessor' ? '/assessors' : '/admin'}
        >
          <img alt="Lighthouse logo" src={customLogo || defaultLogo} />
        </Link>
      </div>
    </>
  )
}
