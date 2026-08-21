import { Modal } from 'antd'
import {
  FC, useEffect, useRef, useState, useMemo,
} from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { HistoryOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { getFeatures } from '~/core/config'
import { EXTEND_SESSION, extendSession } from '~/core/extendSession'
import { get as getCurrentUser } from '~/core/currentUser'
import { isRequestInProgress } from '~/core/request'
import { CountdownTimer } from '~/glint/components/CountdownTimer'
import styles from './styles.less'
import { RootState } from '~/core/reducers'
import { SYNC_TIMEOUT_CHANNEL } from '~/constants/channelNames'

const connector = connect((state: RootState) => ({
  currentUser: getCurrentUser(state),
  sessionExtending: isRequestInProgress(state, EXTEND_SESSION),
  features: getFeatures(state),

}), { extendSession })

type PropsFromRedux = ConnectedProps<typeof connector>

const { I18n } = window

const DEFAULT_SESSION_POPUP_DURATION = 120

export const SessionTimeoutModalComponent: FC<PropsFromRedux> = ({
  extendSession, currentUser, sessionExtending, features,
}) => {
  const [showPopup, setShowPopup] = useState<boolean>(false)
  const [countdownSeconds, setCountdownSeconds] = useState(DEFAULT_SESSION_POPUP_DURATION)
  const isFlashing = useRef<boolean>(false)
  const flashInterval = useRef<NodeJS.Timeout | null>(null)

  const originalTitle = useRef<string>(document.title)
  const originalFavicons = useRef<string[]>([])
  const [popupMessage, setPopupMessage] = useState<string>('')
  const [isSessionTimedOut, setSessionTimedOut] = useState<boolean>(false)
  const [key, setKey] = useState(0) // To reset the Countdown component

  const [currentNextTimeout, setCurrentNextTimeout] = useState({})
  const channel = useMemo(() => new BroadcastChannel('popup_channel'), [])
  const syncTimeoutChannel = useMemo(() => new BroadcastChannel(SYNC_TIMEOUT_CHANNEL), [])

  useEffect(() => {
    // deepcode ignore InsufficientPostmessageValidation: BroadcastChannel is inherently same-origin
    syncTimeoutChannel.addEventListener('message', (msgEvent) => {
      const { userId, nextTimeout } = msgEvent.data
      if (userId && nextTimeout && (currentNextTimeout[userId] !== nextTimeout)) {
        setCurrentNextTimeout(prevState => ({
          ...prevState,
          [userId]: nextTimeout,
        }))
      }
    })

    return () => {
      syncTimeoutChannel.close()
      channel.close()
    }
  }, [])

  useEffect(() => {
    originalTitle.current = document.title
  }, [document.title])

  useEffect(() => {
    let popupTimer: NodeJS.Timeout
    let delayTimeoutTimer: NodeJS.Timeout

    const links = document.querySelectorAll("link[rel*='icon']") as NodeListOf<HTMLLinkElement>
    const favicons = Array.from(links).map(link => link.href)
    originalFavicons.current = favicons

    const apiTimeoutValue = currentNextTimeout[currentUser.id] || ''

    const timeoutEpochValue = parseInt(apiTimeoutValue, 10) / 1000
    if (isNaN(timeoutEpochValue) || timeoutEpochValue <= 0) {
      return
    }
    const currentTime = Math.floor(Date.now() / 1000)
    const delayUntilTimeout = (timeoutEpochValue - currentTime) * 1000
    const twoMinutesBeforeTimeout = delayUntilTimeout - 2 * 60 * 1000 // 2 minutes in milliseconds


    // Show popup 2 minutes before timeout
    if (twoMinutesBeforeTimeout > 0) {
      popupTimer = setTimeout(() => {
        setShowPopup(true)
        setKey(prev => prev + 1)
        setPopupMessage(`${I18n.t('frontend.session_timeout_modal.message')}`)
      }, twoMinutesBeforeTimeout)
    }

    if (delayUntilTimeout > 0) {
      delayTimeoutTimer = setTimeout(() => {
        setShowPopup(true)
        setSessionTimedOut(true)
        setPopupMessage(`${I18n.t('frontend.session_timeout_modal.message_after_timeout')}`)
      }, delayUntilTimeout)
    }


    return () => {
      clearTimeout(popupTimer)
      clearTimeout(delayTimeoutTimer)
    }
  }, [currentNextTimeout])

  const startFlashing = () => {
    if (!isFlashing.current) {
      isFlashing.current = true
      updateFavicons()
      const originalTitleValue = originalTitle.current
      const flashTitle = `${I18n.t('frontend.session_timeout_modal.title')}`

      flashInterval.current = setInterval(() => {
        document.title = document.title === flashTitle ? originalTitleValue : flashTitle
      }, 1000)
    }
  }

  const stopFlashing = () => {
    if (isFlashing.current) {
      if (flashInterval.current) {
        clearInterval(flashInterval.current)
      }
      isFlashing.current = false
      resetFavicons()
    }
    document.title = originalTitle.current
  }

  const updateFavicons = () => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    const badgeSize = 8
    const badgeOffsetX = 24
    const badgeOffsetY = 8

    originalFavicons.current.map((faviconUrl) => {
      const favicon = new Image()
      favicon.crossOrigin = 'anonymous' // Adding it for security restrictions which restricts cross-origin image access
      favicon.src = faviconUrl


      favicon.onload = () => {
        const size = parseInt(faviconUrl.match(/(\d+)x(\d+)/)?.[0] || '32x32', 10) // Extract size from URL
        canvas.width = size
        canvas.height = size

        if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height)
          context.drawImage(favicon, 0, 0, size, size)

          // Draw the badge
          context.fillStyle = 'red'
          context.beginPath()
          context.arc(badgeOffsetX, badgeOffsetY, badgeSize, 0, Math.PI * 2, true)
          context.fill()

          // Set the favicon with the badge
          const newFavicon = canvas.toDataURL('image/png')
          const link = document.querySelector(`link[rel*='icon'][sizes='${size}x${size}']`) as HTMLLinkElement

          if (link) {
            link.href = newFavicon
          }
        }
      }
      favicon.onerror = () => {
        console.error(`Failed to load favicon: ${faviconUrl}`)
      }
    })
  }

  const resetFavicons = () => {
    const links = document.querySelectorAll("link[rel*='icon']") as NodeListOf<HTMLLinkElement>
    links.forEach((link, index) => {
      link.href = originalFavicons.current[index]
    })
  }

  useEffect(() => {
    // Listen for messages from other tabs
    channel.onmessage = (event) => {
      if (event.data === 'close_popup') {
        setShowPopup(false)
        stopFlashing()
      }
    }
    if (showPopup && !features?.disable_session_timeout) {
      startFlashing()
    } else {
      stopFlashing()
    }

    return () => {
      resetFavicons()
      stopFlashing()
    }
  }, [showPopup, channel])

  const handleOnCancel = () => {
    if (!isSessionTimedOut) {
      window.location.href = '/administration/sign_out'
    }
    channel.postMessage('close_popup')
    setShowPopup(false)
    stopFlashing()
  }

  const handleOnExtendSession = async () => {
    if (isSessionTimedOut) {
      window.location.href = '/administration/sign_out'
      channel.postMessage('close_popup')
      setShowPopup(false)
      stopFlashing()
      return
    }
    extendSession().then(() => {
      // Post message to other tabs to close all popups
      channel.postMessage('close_popup')
      setShowPopup(false)
      setCountdownSeconds(DEFAULT_SESSION_POPUP_DURATION)
      stopFlashing()
    }).catch(() => {
      setShowPopup(true)
    })
  }
  if (features?.disable_session_timeout) return null

  return (
    <div>
      <Modal
        mask={{ closable: false }}
        closable={false}
        centered
        width={500}
        cancelButtonProps={{ style: { display: 'none' } }}
        okText={isSessionTimedOut
          ? `${I18n.t('frontend.session_timeout_modal.buttons.re_login')}`
          : `${I18n.t('frontend.session_timeout_modal.buttons.stay_logged_in')}`}
        className={styles.modalContainer}
        title={(
          <span className={styles.title}>
            <HistoryOutlined />
            {I18n.t('frontend.session_timeout_modal.title')}
          </span>
          )}
        open={showPopup}
        okButtonProps={{ loading: sessionExtending }}
        onOk={handleOnExtendSession}
        onCancel={handleOnCancel}
        zIndex={9999}
      >
        <span>
          {popupMessage}
        </span>
        {
          !isSessionTimedOut && (
            <div className={styles.countdownTimer}>
              <CountdownTimer
                key={key}
                title={`${I18n.t('frontend.session_timeout_modal.time_remaining')}`}
                seconds={countdownSeconds}
              />
            </div>
          )
        }
      </Modal>
    </div>
  )
}

export const SessionTimeoutModal = connector(SessionTimeoutModalComponent)
