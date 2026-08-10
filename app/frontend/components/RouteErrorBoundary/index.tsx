import { Component, ReactNode, ErrorInfo } from 'react'
import { Button, Result } from 'antd'
import { Link } from 'react-router-dom'

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Change this to clear a caught error without remounting the boundary's subtree. */
  resetKey?: string | number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  resetKey?: string | number;
}

const { I18n } = window

class RouteErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor (props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      resetKey: props.resetKey,
    }
  }

  static getDerivedStateFromError (error: Error) {
    return { hasError: true, error }
  }

  // A new resetKey clears the caught error in place, so the subtree recovers without being remounted.
  static getDerivedStateFromProps (props: ErrorBoundaryProps, state: ErrorBoundaryState) {
    if (props.resetKey === state.resetKey) return null

    return state.hasError
      ? { hasError: false, error: null, resetKey: props.resetKey }
      : { resetKey: props.resetKey }
  }

  componentDidCatch (error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props
    if (onError) {
      onError(error, errorInfo)
    } else {
      console.error('RouteErrorBoundary caught an error:', error, errorInfo)
    }
  }

  render () {
    const { hasError, error } = this.state
    const { fallback, children } = this.props

    if (hasError) {
      if (fallback) {
        return fallback
      }

      return (
        <Result
          status="error"
          title={I18n.t('errors.error_msg')}
          subTitle={error ? error.message : ''}
          extra={[
            <Button type="primary" key="refresh" onClick={() => window.location.reload()}>
              {I18n.t('frontend.request_failed_message_box.refresh')}
            </Button>,
            <Link to="/">{I18n.t('campaign.dashboard_menu.home')}</Link>,
          ]}
        />
      )
    }
    return children
  }
}

export default RouteErrorBoundary
