import React, { FC, HTMLAttributes } from 'react'
import {
  LeftOutlined, RightOutlined, ArrowLeftOutlined, ArrowRightOutlined,
} from '@ant-design/icons'

import { isRtl } from '~/utils/locales'

const { I18n } = window
const uiLocale = I18n && I18n.uiLocale
const rtl = uiLocale && isRtl(uiLocale)

type Props = {
  RtlIcon: (iconProps: HTMLAttributes<HTMLAnchorElement>) => React.ReactElement | null
  LtrIcon: (iconProps: HTMLAttributes<HTMLAnchorElement>) => React.ReactElement | null
}

export const DirectionAwareIcon:FC<Props> = ({
  RtlIcon, LtrIcon, ...iconProps
}) => (
  rtl ? <RtlIcon {...iconProps} /> : <LtrIcon {...iconProps} />
)

export const DirectionalArrowIcon = (props: HTMLAttributes<HTMLAnchorElement>) => (
  <DirectionAwareIcon
    {...props}
    RtlIcon={LeftOutlined}
    LtrIcon={RightOutlined}
  />
)

export const DirectionalNavigateBackIcon = (props: HTMLAttributes<HTMLAnchorElement>) => (
  <DirectionAwareIcon
    {...props}
    RtlIcon={ArrowRightOutlined}
    LtrIcon={ArrowLeftOutlined}
  />
)

export const DirectionalBackArrowIcon = (props: HTMLAttributes<HTMLAnchorElement>) => (
  <DirectionAwareIcon
    {...props}
    LtrIcon={LeftOutlined}
    RtlIcon={RightOutlined}
  />
)

export const DirectionalNavigateIcon = (props: HTMLAttributes<HTMLAnchorElement>) => (
  <DirectionAwareIcon
    {...props}
    LtrIcon={ArrowRightOutlined}
    RtlIcon={ArrowLeftOutlined}
  />
)
