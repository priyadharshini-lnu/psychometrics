import { Button, ButtonProps } from 'antd'
import cs from 'classnames'
import {
  DownloadOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import styles from './styles.less'

export const DownloadButton = ({ children, className, ...restProps }:ButtonProps) => (
  <Button
    key="download"
    icon={<DownloadOutlined />}
    target="_blank"
    size="small"
    className={cs(className, styles.downloadButton)}
    {...restProps}
  >
    {children}
  </Button>
)
