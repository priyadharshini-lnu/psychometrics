import { FC } from 'react'
import Icon, {
  InfoCircleOutlined as AntdInfoCircleOutlined,
  PlayCircleOutlined as AntdPlayCircleOutlined,
  ClockCircleOutlined as AntdClockCircleOutlined,
  CheckCircleOutlined as AntdCheckCircleOutlined,
  ReloadOutlined as AntdReloadOutlined,
  LoadingOutlined as AntdLoadingOutlined,
  UserOutlined as AntdUserOutlined,
  HomeOutlined as AntdHomeOutlined,
  CalendarOutlined as AntdCalendarOutlined,
  ReadOutlined as AntdReadOutlined,
  PlusOutlined as AntdPlusOutlined,
  MinusOutlined as AntdMinusOutlined,
  DownOutlined as AntdDownOutlined,
  TeamOutlined as AntdTeamOutlined,
  CloseOutlined as AntdCloseOutlined,
  DeleteOutlined as AntdDeleteOutlined,
  CheckOutlined as AntdCheckOutlined,
  GlobalOutlined as AntdGlobalOutlined,
  UnorderedListOutlined as AntdUnorderedListOutlined,
  AppstoreOutlined as AntdAppstoreOutlined,
  ArrowLeftOutlined as AntdArrowLeftOutlined,
  ArrowRightOutlined as AntdArrowRightOutlined,
  LeftOutlined as AntdLeftOutlined,
  RightOutlined as AntdRightOutlined,
  DownloadOutlined as AntdDownloadOutlined,
  RedoOutlined as AntdRedoOutlined,
  SafetyCertificateOutlined as AntdSafetyCertificateOutlined,
  QuestionCircleOutlined as AntdQuestionCircleOutlined,
  CheckCircleFilled as AntdCheckCircleFilled,
  EllipsisOutlined as AntdEllipsisOutlined,
  CloseCircleFilled as AntdCloseCircleFilled,
  UploadOutlined as AntdUploadOutlined,
  EyeTwoTone as AntdEyeTwoTone,
  EyeInvisibleOutlined as AntdEyeInvisibleOutlined,
} from '@ant-design/icons'
import type { IconComponentProps } from '@ant-design/icons/lib/components/Icon'

const withAccessibilityProps = (AntIcon: typeof Icon) => {
  const WithAccessibilityProps:FC<IconComponentProps> = props => <AntIcon aria-hidden aria-label="" {...props} />

  return WithAccessibilityProps
}

export const InfoCircleOutlined = withAccessibilityProps(AntdInfoCircleOutlined)
export const PlayCircleOutlined = withAccessibilityProps(AntdPlayCircleOutlined)
export const ClockCircleOutlined = withAccessibilityProps(AntdClockCircleOutlined)
export const CheckCircleOutlined = withAccessibilityProps(AntdCheckCircleOutlined)
export const ReloadOutlined = withAccessibilityProps(AntdReloadOutlined)
export const LoadingOutlined = withAccessibilityProps(AntdLoadingOutlined)
export const UserOutlined = withAccessibilityProps(AntdUserOutlined)
export const HomeOutlined = withAccessibilityProps(AntdHomeOutlined)
export const CalendarOutlined = withAccessibilityProps(AntdCalendarOutlined)
export const ReadOutlined = withAccessibilityProps(AntdReadOutlined)
export const PlusOutlined = withAccessibilityProps(AntdPlusOutlined)
export const MinusOutlined = withAccessibilityProps(AntdMinusOutlined)
export const DownOutlined = withAccessibilityProps(AntdDownOutlined)
export const TeamOutlined = withAccessibilityProps(AntdTeamOutlined)
export const CloseOutlined = withAccessibilityProps(AntdCloseOutlined)
export const DeleteOutlined = withAccessibilityProps(AntdDeleteOutlined)
export const CheckOutlined = withAccessibilityProps(AntdCheckOutlined)
export const GlobalOutlined = withAccessibilityProps(AntdGlobalOutlined)
export const UnorderedListOutlined = withAccessibilityProps(AntdUnorderedListOutlined)
export const AppstoreOutlined = withAccessibilityProps(AntdAppstoreOutlined)
export const ArrowLeftOutlined = withAccessibilityProps(AntdArrowLeftOutlined)
export const ArrowRightOutlined = withAccessibilityProps(AntdArrowRightOutlined)
export const LeftOutlined = withAccessibilityProps(AntdLeftOutlined)
export const RightOutlined = withAccessibilityProps(AntdRightOutlined)
export const DownloadOutlined = withAccessibilityProps(AntdDownloadOutlined)
export const RedoOutlined = withAccessibilityProps(AntdRedoOutlined)
export const SafetyCertificateOutlined = withAccessibilityProps(AntdSafetyCertificateOutlined)
export const QuestionCircleOutlined = withAccessibilityProps(AntdQuestionCircleOutlined)
export const CheckCircleFilled = withAccessibilityProps(AntdCheckCircleFilled)
export const EllipsisOutlined = withAccessibilityProps(AntdEllipsisOutlined)
export const CloseCircleFilled = withAccessibilityProps(AntdCloseCircleFilled)
export const UploadOutlined = withAccessibilityProps(AntdUploadOutlined)
export const EyeTwoTone = withAccessibilityProps(AntdEyeTwoTone)
export const EyeInvisibleOutlined = withAccessibilityProps(AntdEyeInvisibleOutlined)
