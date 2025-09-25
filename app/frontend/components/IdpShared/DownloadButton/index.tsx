import { Button, ButtonProps } from 'antd'
import {
  DownloadOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import styles from './styles.less'

export const DownloadButton = ({ children, ...restProps }:ButtonProps) => (
  <Button
    key="download"
    icon={<DownloadOutlined />}
    target="_blank"
    size="small"
    className={styles.downloadButton}
    {...restProps}
  >
    {children}
  </Button>
)
