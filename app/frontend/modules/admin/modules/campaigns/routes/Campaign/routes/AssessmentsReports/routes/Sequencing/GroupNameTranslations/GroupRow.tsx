import { Input, Typography } from 'antd'
import styles from './styles.less'

export type GroupRowProps = {
  currentValue: string
  referenceValue: string
  referenceLocale: string | undefined
  error: string
  onChange: (value: string) => void
}

export const GroupRow = ({
  currentValue,
  referenceValue,
  referenceLocale,
  error,
  onChange,
}: GroupRowProps) => (
  <div className={styles.groupRow}>
    <div className={styles.groupNameInput}>
      <Input
        value={currentValue}
        onChange={({ target: { value } }) => onChange(value)}
        status={error ? 'error' : ''}
      />
      {error && (
        <Typography.Text type="danger" className={styles.errorText}>
          {error}
        </Typography.Text>
      )}
    </div>
    {referenceLocale && (
      <Typography.Text className={styles.referenceValue}>
        {referenceValue}
      </Typography.Text>
    )}
  </div>
)
