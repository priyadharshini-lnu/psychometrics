import {
  Typography, Alert,
} from 'antd'

const { I18n } = window

export const AlertNotification = ({ errorMessageList }) => (
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
        <Typography.Text style={{
          fontWeight: 700,
          color: 'var(--ant-error-color)',
        }}
        >
          {I18n.t('enduser.how_to_fix')}
        </Typography.Text>
        <ul style={{ paddingInlineStart: '1.5rem' }}>
          {errorMessageList.map((message, index) => (
            <li key={index}>
              <span>{message}</span>
            </li>
          ))}
        </ul>
      </div>
                )}
    type="error"
    showIcon={false}
  />
)
