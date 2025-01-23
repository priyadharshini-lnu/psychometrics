

import { ReactElement, FC } from 'react'
import { Tooltip } from 'antd'
import cs from 'classnames'
import { TooltipPlacement } from 'antd/lib/tooltip'
import styles from './HintTooltip.less'

type Props = {
  show?: boolean
  className?: string
  hintClassName?: string
  overlayClassName?: string
  hint: string
  placement?: TooltipPlacement
  children?: ReactElement
}

export const HintTooltip: FC<Props> = ({
  hint, className, hintClassName, overlayClassName, placement = 'left', children = null, show = true,
}) => (
  show ? (
    <div className={styles.container}>
      <Tooltip
        placement={placement}
        overlayClassName={cs(styles.tooltip, overlayClassName)}
        title={(
          <div className={cs(styles.hint, className)}>
            <div className={cs(hintClassName, styles.active)}>
              {hint}
            </div>
          </div>
        )}
      >
        {children}
      </Tooltip>
    </div>
  ) : children
)
