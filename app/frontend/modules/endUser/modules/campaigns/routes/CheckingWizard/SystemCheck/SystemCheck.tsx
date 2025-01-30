import React, { useEffect, useReducer } from 'react'
import { Button, Card, Flex } from 'antd'
import { RightOutlined, WarningOutlined } from '@ant-design/icons'
import { BROWSER_FEATURES } from '~/modules/survey/constants/browser'
import { BROWSER_NAME, checkBrowserSupportForFeature } from '~/utils/uaParser'
import reducer, {
  initialState, updateAccess,
  updateSystemCheck,
} from '../VideoCheck/reducer'
import styles from '../CardStyles.less'
import { CheckListStatus } from '../interfaces'
import { CheckList } from '../CheckList'

interface Props {
  nextStep: () => void
}
const { I18n } = window

export const SystemCheck: React.FC<Props> = ({ nextStep }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const { isBrowserSupported } = checkBrowserSupportForFeature(
    BROWSER_FEATURES.mediaRecorderAPI,
  )

  async function isGetUserMediaSupported () {
    dispatch(updateSystemCheck(CheckListStatus.InProgress))
    dispatch(updateAccess(CheckListStatus.InProgress))
    if (isBrowserSupported) {
      dispatch(updateSystemCheck(CheckListStatus.Done))
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        dispatch(updateAccess(CheckListStatus.Done))
      } catch (e) {
        dispatch(updateAccess(CheckListStatus.Failed))
      }
    } else {
      dispatch(updateSystemCheck(CheckListStatus.Failed))
    }
  }

  useEffect(() => {
    isGetUserMediaSupported()
  }, [])

  return (
    <div className={styles.container}>
      {state.access === CheckListStatus.Failed && <WarningOutlined className={styles.warning} />}
      <h4 style={{ color: state.access === CheckListStatus.Failed ? 'red' : 'inherit' }}>
        {
        state.access === CheckListStatus.Failed
          ? `${I18n.t('checking_wizard.system_check.failure.title')}`
          : `${I18n.t('checking_wizard.system_check.title')}`
        }
      </h4>
      <p>
        {
          state.access === CheckListStatus.Failed && `${I18n.t('checking_wizard.system_check.failure.description')}`
        }
      </p>
      {
        state.access === CheckListStatus.Failed

          ? (
            <Card className={styles.card}>
              <Flex vertical>
                <p style={{ alignSelf: 'baseline' }}>
                  <b>
                    {I18n.t('checking_wizard.system_check.failure.subtitle')}
                  </b>
                </p>
                <p>
                  -
                  {I18n.t('checking_wizard.system_check.failure.link_text_action')}
                  {' '}
                  <a
                    href={`https://www.google.com/search?q=allow+camera+and+microphone+access+on+${BROWSER_NAME}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {I18n.t('checking_wizard.system_check.failure.link_text')}
                  </a>
                  {' '}
                  {I18n.t('checking_wizard.system_check.failure.link_text_instruction')}
                </p>
                <p>
                  -
                  {I18n.t('checking_wizard.system_check.failure.refresh_text')}
                </p>
              </Flex>
            </Card>
          )

          : (
            <CheckList
              className="mt24"
              dataSource={[
                { name: `${I18n.t('checking_wizard.system_check.compatibility')}`, status: state.systemCheck },
                { name: `${I18n.t('checking_wizard.system_check.permissions')}`, status: state.access },
              ]}
            />
          )
      }

      {state.access === CheckListStatus.Failed
        ? (
          <Button
            type="primary"
            onClick={() => window.location.reload()}
            className={styles.button}
          >
            {I18n.t('checking_wizard.system_check.failure.refresh')}
            <RightOutlined />
          </Button>
        )
        : (
          <Button
            type="primary"
            disabled={state.access === 'in_progress'}
            className={styles.button}
            onClick={nextStep}
          >
            {I18n.t('checking_wizard.system_check.continue')}
            <RightOutlined />
          </Button>
        )
    }

    </div>
  )
}
