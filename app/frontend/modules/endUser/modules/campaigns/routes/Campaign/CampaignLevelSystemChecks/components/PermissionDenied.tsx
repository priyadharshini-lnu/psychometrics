import {
  Flex, Alert, Typography,
} from 'antd'
import {
  ExclamationCircleOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { ButtonWithArrow } from '~/glint'
import { BROWSER_NAME } from '~/utils/uaParser'
import commonStyles from '../common-styles.less'
import { CHECK_TYPE } from '../common'

const { I18n } = window

export const PermissionDenied = ({ handleNext, checkType }: {
  handleNext: () => void,
  checkType: CHECK_TYPE.audio | CHECK_TYPE.video,
}) => (
  <Flex style={{ width: '100%' }} vertical gap={8}>
    <Flex
      vertical
      justify="center"
      align="center"
      className={`p-4 ${commonStyles['bg-off-white']} ${commonStyles['border-dark']}`}
      style={{
        minHeight: '400px',
        width: '100%',
        textAlign: 'center',
      }}
    >
      <ExclamationCircleOutlined style={{ fontSize: '2rem', color: 'var(--ant-error-color)' }} className="mb-2" />
      <h4 style={{ maxWidth: '500px' }} className="mt-0">
        {checkType === CHECK_TYPE.audio
          ? I18n.t('enduser.microphone_access_blocked') : I18n.t('enduser.camera_access_blocked')}
      </h4>
    </Flex>

    <Alert
      styles={{
        root: {
          backgroundColor: 'rgba(240, 240, 240, 1)',
          border: '1px solid rgba(0, 0, 0, 0.15)',
          borderRadius: '6px',
        },
      }}
      className="mb-2"
      title={(
        <div>
          <Typography.Text style={{ fontWeight: 700, color: 'var(--ant-error-color)' }}>
            {I18n.t('enduser.how_to_fix')}
          </Typography.Text>
          <ul style={{ paddingInlineStart: '1.5rem' }}>
            <li>
              <p className="mb-0">
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
            </li>
            <li>
              <p className="mb-0">
                {I18n.t('checking_wizard.system_check.failure.refresh_text')}
              </p>
            </li>
          </ul>
        </div>
              )}
      showIcon={false}
    />
    <Flex justify="end" gap={4} className="mt-2">
      <ButtonWithArrow
        style={{ alignSelf: 'flex-end' }}
        label={I18n.t('shared.continue')}
        type="primary"
        onClick={() => handleNext?.()}
      />
    </Flex>
  </Flex>
)
