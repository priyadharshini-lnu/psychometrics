

import { ReactElement, FC } from 'react'
import { Tooltip } from 'antd'
import cs from 'classnames'
import { TooltipPlacement } from 'antd/lib/tooltip'
import styles from './HintTooltip.less'

type Props = {
  show?: boolean
  className?: string
  hintClassName?: string
  rootClassName?: string
  hint: string
  placement?: TooltipPlacement
  children?: ReactElement
}

export const HintTooltip: FC<Props> = ({
  hint, className, hintClassName, rootClassName, placement = 'left', children = null, show = true,
}) => (
  show ? (
    <div className={styles.container}>
      <Tooltip
        placement={placement}
        classNames={{ root: cs(styles.tooltip, rootClassName) }}
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
