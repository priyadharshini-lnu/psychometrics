import {
  Component, ReactNode, ErrorInfo, useEffect,
} from 'react'
import { Button, Result } from 'antd'
import { Link, useInRouterContext, useRouteError } from 'react-router-dom'
import * as Sentry from '@sentry/react'

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  /** Change this to clear a caught error without remounting the boundary's subtree. */
  resetKey?: string | number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  resetKey?: string | number;
}

const { I18n } = window

// The auth entrypoint mounts its boundary above the router, where a Link would throw.
const HomeLink = () => (
  useInRouterContext() ? <Link to="/">{I18n.t('campaign.dashboard_menu.home')}</Link> : null
)

const ErrorCard = ({ title, subTitle }: { title: string, subTitle?: string }) => (
  <Result
    status="error"
    title={title}
    subTitle={subTitle}
    extra={[
      <Button type="primary" key="refresh" onClick={() => window.location.reload()}>
        {I18n.t('frontend.request_failed_message_box.refresh')}
      </Button>,
      <HomeLink key="home" />,
    ]}
  />
)

// `useRouteError` needs a data router, so reporting lives here rather than in the card the class boundary reuses.
export const RouteErrorCard = () => {
  const error = useRouteError()

  useEffect(() => {
    if (error !== undefined) {
      console.error(error)
      Sentry.captureException(error)
    }
  }, [error])

  return <ErrorCard title={I18n.t('admin.page_load_failed')} subTitle={I18n.t('admin.page_load_failed_hint')} />
}

class RouteErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor (props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      resetKey: props.resetKey,
    }
  }

  static getDerivedStateFromError () {
    return { hasError: true }
  }

  // A new resetKey clears the caught error in place, so the subtree recovers without being remounted.
  static getDerivedStateFromProps (props: ErrorBoundaryProps, state: ErrorBoundaryState) {
    if (props.resetKey === state.resetKey) return null

    return state.hasError
      ? { hasError: false, resetKey: props.resetKey }
      : { resetKey: props.resetKey }
  }

  componentDidCatch (error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo.componentStack)
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } })
  }

  render () {
    const { hasError } = this.state
    const { fallback, children } = this.props

    if (hasError) {
      return fallback || <ErrorCard title={I18n.t('errors.error_msg')} />
    }
    return children
  }
}

export default RouteErrorBoundary
