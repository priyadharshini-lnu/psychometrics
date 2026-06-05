import { FC } from 'react'
import AntdIcon, {
  InfoCircleOutlined as AntdInfoCircleOutlined,
  InfoCircleFilled as AntdInfoCircleFilled,
  PlayCircleOutlined as AntdPlayCircleOutlined,
  ClockCircleOutlined as AntdClockCircleOutlined,
  ClockCircleFilled as AntdClockCircleFilled,
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
  UpOutlined as AntdUpOutlined,
  TeamOutlined as AntdTeamOutlined,
  CloseOutlined as AntdCloseOutlined,
  DeleteOutlined as AntdDeleteOutlined,
  CheckOutlined as AntdCheckOutlined,
  GlobalOutlined as AntdGlobalOutlined,
  UnorderedListOutlined as AntdUnorderedListOutlined,
  AppstoreOutlined as AntdAppstoreOutlined,
  ArrowLeftOutlined as AntdArrowLeftOutlined,
  ArrowRightOutlined as AntdArrowRightOutlined,
  ArrowUpOutlined as AntdArrowUpOutlined,
  ArrowDownOutlined as AntdArrowDownOutlined,
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
  CaretRightOutlined as AntdCaretRightOutlined,
  PauseOutlined as AntdEyePauseOutlined,
  EditOutlined as AntdEditOutlined,
  ExpandOutlined as AntdExpandOutlined,
  SettingOutlined as AntdSettingsOutlined,
  MonitorOutlined as AntdMonitorOutlined,
  MenuFoldOutlined as AntdMenuFoldOutlined,
  MenuUnfoldOutlined as AntdMenuUnfoldOutlined,
  LaptopOutlined as AntdLaptopOutlined,
  AudioOutlined as AntdAudioOutlined,
  VideoCameraOutlined as AntdVideoCameraOutlined,
  StopOutlined as AntdStopOutlined,
  WarningOutlined as AntdWarningOutlined,
  ToolOutlined as AntdToolOutlined,
  CloudDownloadOutlined as AntdCloudDownloadOutlined,
  FilterOutlined as AntdFilterOutlined,
  FilterFilled as AntdFilterFilled,
  PlusCircleOutlined as AntdPlusCircleOutlined,
  MinusCircleOutlined as AntdMinusCircleOutlined,
  MessageOutlined as AntdMessageOutlined,
  WarningFilled as AntWarningFilled,
  SendOutlined as AntdSendOutlined,
  SyncOutlined as AntdSyncOutlined,
  ScissorOutlined as AntdScissorOutlined,
  IdcardOutlined as AntdIdcardOutlined,
  CopyOutlined as AntdCopyOutlined,
  MoreOutlined as AntdMoreOutlined,
  MenuOutlined as AntdMenuOutlined,
  CloseCircleOutlined as AntdCloseCircleOutlined,
  ContainerOutlined as AntdContainerOutlined,
  BuildOutlined as AntdBuildOutlined,
  DatabaseOutlined as AntdDatabaseOutlined,
  FileImageOutlined as AntdFileImageOutlined,
  AuditOutlined as AntdAuditOutlined,
  ProfileOutlined as AntdProfileOutlined,
  FileProtectOutlined as AntdFileProtectOutlined,
  MailOutlined as AntdMailOutlined,
  FundProjectionScreenOutlined as AntdFundProjectionScreenOutlined,
  FormOutlined as AntdFormOutlined,
  ClusterOutlined as AntdClusterOutlined,
  ScheduleOutlined as AntdScheduleOutlined,
  DashboardOutlined as AntdDashboardOutlined,
  LayoutOutlined as AntdLayoutOutlined,
  BookOutlined as AntdBookOutlined,
  RobotOutlined as AntdRobotOutlined,
  CompassOutlined as AntdCompassOutlined,
  HistoryOutlined as AntdHistoryOutlined,
  ExclamationCircleOutlined as AntdExclamationCircleOutlined,
  UndoOutlined as AntdUndoOutlined,
  EyeOutlined as AntdEyeOutlined,
  FileTextOutlined as AntdFileTextOutlined,
  ThunderboltOutlined as AntdThunderboltOutlined,
  IssuesCloseOutlined as AntdIssuesCloseOutlined,
  StarFilled as AntdStarFilled,
  StarOutlined as AntdStarOutlined,
  LockOutlined as AntdLockOutlined,
  BellOutlined as AntdBellOutlined,
  BellFilled as AntdBellFilled,
  LogoutOutlined as AntdLogoutOutlined,
  ShopOutlined as AntdShopOutlined,
  EyeFilled as AntdEyeFilled,
  SearchOutlined as AntdSearchOutlined,
  SettingOutlined as AntdSettingOutlined,
  PieChartOutlined as AntdPieChartOutlined,
  QrcodeOutlined as AntdQrcodeOutlined,
  SolutionOutlined as AntdSolutionOutlined,
  LineChartOutlined as AntdLineChartOutlined,
  RadarChartOutlined as AntdRadarChartOutlined,
  ExportOutlined as AntdExportOutlined,
  DragOutlined as AntdDragOutlined,
  BlockOutlined as AntdBlockOutlined,
  SaveOutlined as AntdSaveOutlined,
  FilePdfOutlined as AntdFilePdfOutlined,
  CrownOutlined as AntdCrownOutlined,
  ApartmentOutlined as AntdApartmentOutlined,
  ColumnWidthOutlined as AntdColumnWidthOutlined,
  FullscreenOutlined as AntdFullscreenOutlined,
  FileOutlined as AntdFileOutlined,
  FolderOpenOutlined as AntdFolderOpenOutlined,
  FolderOutlined as AntdFolderOutlined,
  CloudUploadOutlined as AntdCloudUploadOutlined,
  PauseCircleOutlined as AntdPauseCircleOutlined,
  ImportOutlined as AntdImportOutlined,
  SnippetsOutlined as AntdSnippetsOutlined,
  RadiusUpleftOutlined as AntdRadiusUpleftOutlined,
  RadiusUprightOutlined as AntdRadiusUprightOutlined,
  RadiusBottomrightOutlined as AntdRadiusBottomrightOutlined,
  RadiusBottomleftOutlined as AntdRadiusBottomleftOutlined,
  BorderOuterOutlined as AntdBorderOuterOutlined,
  UnlockOutlined as AntdUnlockOutlined,
  PictureOutlined as AntdPictureOutlined,
  FieldTimeOutlined as AntdFieldTimeOutlined,
  ExclamationCircleFilled as AntdExclamationCircleFilled,
  ClearOutlined as AntdClearOutlined,
  CaretDownFilled as AntdCaretDownFilled,
  CaretDownOutlined as AntdCaretDownOutlined,
  InfoOutlined as AntdInfoOutlined,
  SwapOutlined as AntdSwapOutlined,
  PartitionOutlined as AntdPartitionOutlined,
  TranslationOutlined as AntdTranslationOutlined,
  TableOutlined as AntdTableOutlined,
  ArrowsAltOutlined as AntdArrowsAltOutlined,
  ShrinkOutlined as AntdShrinkOutlined,
  WifiOutlined as AntdWifiOutlined,
  DesktopOutlined as AntDesktopOutlined,
  BulbOutlined as AntdBulbOutlined,
  CloudOutlined as AntdCloudOutlined,
  SafetyOutlined as AntdSafetyOutlined,
  Loading3QuartersOutlined as AntdLoading3QuartersOutlined,
  CaretRightFilled as AntdCaretRightFilled,
} from '@ant-design/icons'
import type { IconComponentProps } from '@ant-design/icons/lib/components/Icon'

const withAccessibilityProps = (AntIcon: typeof AntdIcon) => {
  const WithAccessibilityProps:FC<IconComponentProps> = props => <AntIcon aria-hidden aria-label="" {...props} />

  return WithAccessibilityProps
}

export const InfoCircleOutlined = withAccessibilityProps(AntdInfoCircleOutlined)
export const InfoCircleFilled = withAccessibilityProps(AntdInfoCircleFilled)
export const PlayCircleOutlined = withAccessibilityProps(AntdPlayCircleOutlined)
export const ClockCircleOutlined = withAccessibilityProps(AntdClockCircleOutlined)
export const ClockCircleFilled = withAccessibilityProps(AntdClockCircleFilled)
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
export const UpOutlined = withAccessibilityProps(AntdUpOutlined)
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
export const CaretRightOutlined = withAccessibilityProps(AntdCaretRightOutlined)
export const PauseOutlined = withAccessibilityProps(AntdEyePauseOutlined)
export const EditOutlined = withAccessibilityProps(AntdEditOutlined)
export const ExpandOutlined = withAccessibilityProps(AntdExpandOutlined)
export const SettingsOutlined = withAccessibilityProps(AntdSettingsOutlined)
export const MonitorOutlined = withAccessibilityProps(AntdMonitorOutlined)
export const MenuFoldOutlined = withAccessibilityProps(AntdMenuFoldOutlined)
export const MenuUnfoldOutlined = withAccessibilityProps(AntdMenuUnfoldOutlined)
export const LaptopOutlined = withAccessibilityProps(AntdLaptopOutlined)
export const AudioOutlined = withAccessibilityProps(AntdAudioOutlined)
export const VideoCameraOutlined = withAccessibilityProps(AntdVideoCameraOutlined)
export const StopOutlined = withAccessibilityProps(AntdStopOutlined)
export const WarningOutlined = withAccessibilityProps(AntdWarningOutlined)
export const ToolOutlined = withAccessibilityProps(AntdToolOutlined)
export const CloudDownloadOutlined = withAccessibilityProps(AntdCloudDownloadOutlined)
export const FilterFilled = withAccessibilityProps(AntdFilterFilled)
export const PlusCircleOutlined = withAccessibilityProps(AntdPlusCircleOutlined)
export const MinusCircleOutlined = withAccessibilityProps(AntdMinusCircleOutlined)
export const MessageOutlined = withAccessibilityProps(AntdMessageOutlined)
export const WarningFilled = withAccessibilityProps(AntWarningFilled)
export const FilterOutlined = withAccessibilityProps(AntdFilterOutlined)
export const ArrowUpOutlined = withAccessibilityProps(AntdArrowUpOutlined)
export const ArrowDownOutlined = withAccessibilityProps(AntdArrowDownOutlined)
export const SendOutlined = withAccessibilityProps(AntdSendOutlined)
export const SyncOutlined = withAccessibilityProps(AntdSyncOutlined)
export const ScissorOutlined = withAccessibilityProps(AntdScissorOutlined)
export const IdcardOutlined = withAccessibilityProps(AntdIdcardOutlined)
export const CopyOutlined = withAccessibilityProps(AntdCopyOutlined)
export const MoreOutlined = withAccessibilityProps(AntdMoreOutlined)
export const MenuOutlined = withAccessibilityProps(AntdMenuOutlined)
export const CloseCircleOutlined = withAccessibilityProps(AntdCloseCircleOutlined)
export const ContainerOutlined = withAccessibilityProps(AntdContainerOutlined)
export const BuildOutlined = withAccessibilityProps(AntdBuildOutlined)
export const DatabaseOutlined = withAccessibilityProps(AntdDatabaseOutlined)
export const FileImageOutlined = withAccessibilityProps(AntdFileImageOutlined)
export const AuditOutlined = withAccessibilityProps(AntdAuditOutlined)
export const ProfileOutlined = withAccessibilityProps(AntdProfileOutlined)
export const FileProtectOutlined = withAccessibilityProps(AntdFileProtectOutlined)
export const MailOutlined = withAccessibilityProps(AntdMailOutlined)
export const FundProjectionScreenOutlined = withAccessibilityProps(AntdFundProjectionScreenOutlined)
export const FormOutlined = withAccessibilityProps(AntdFormOutlined)
export const ClusterOutlined = withAccessibilityProps(AntdClusterOutlined)
export const ScheduleOutlined = withAccessibilityProps(AntdScheduleOutlined)
export const DashboardOutlined = withAccessibilityProps(AntdDashboardOutlined)
export const LayoutOutlined = withAccessibilityProps(AntdLayoutOutlined)
export const BookOutlined = withAccessibilityProps(AntdBookOutlined)
export const RobotOutlined = withAccessibilityProps(AntdRobotOutlined)
export const CompassOutlined = withAccessibilityProps(AntdCompassOutlined)
export const HistoryOutlined = withAccessibilityProps(AntdHistoryOutlined)
export const ExclamationCircleOutlined = withAccessibilityProps(AntdExclamationCircleOutlined)
export const UndoOutlined = withAccessibilityProps(AntdUndoOutlined)
export const EyeOutlined = withAccessibilityProps(AntdEyeOutlined)
export const FileTextOutlined = withAccessibilityProps(AntdFileTextOutlined)
export const ThunderboltOutlined = withAccessibilityProps(AntdThunderboltOutlined)
export const IssuesCloseOutlined = withAccessibilityProps(AntdIssuesCloseOutlined)
export const StarFilled = withAccessibilityProps(AntdStarFilled)
export const StarOutlined = withAccessibilityProps(AntdStarOutlined)
export const LockOutlined = withAccessibilityProps(AntdLockOutlined)
export const BellOutlined = withAccessibilityProps(AntdBellOutlined)
export const BellFilled = withAccessibilityProps(AntdBellFilled)
export const LogoutOutlined = withAccessibilityProps(AntdLogoutOutlined)
export const ShopOutlined = withAccessibilityProps(AntdShopOutlined)
export const EyeFilled = withAccessibilityProps(AntdEyeFilled)
export const SearchOutlined = withAccessibilityProps(AntdSearchOutlined)
export const SettingOutlined = withAccessibilityProps(AntdSettingOutlined)
export const PieChartOutlined = withAccessibilityProps(AntdPieChartOutlined)
export const QrcodeOutlined = withAccessibilityProps(AntdQrcodeOutlined)
export const SolutionOutlined = withAccessibilityProps(AntdSolutionOutlined)
export const LineChartOutlined = withAccessibilityProps(AntdLineChartOutlined)
export const RadarChartOutlined = withAccessibilityProps(AntdRadarChartOutlined)
export const ExportOutlined = withAccessibilityProps(AntdExportOutlined)
export const DragOutlined = withAccessibilityProps(AntdDragOutlined)
export const BlockOutlined = withAccessibilityProps(AntdBlockOutlined)
export const SaveOutlined = withAccessibilityProps(AntdSaveOutlined)
export const FilePdfOutlined = withAccessibilityProps(AntdFilePdfOutlined)
export const SearchIcon = withAccessibilityProps(AntdSearchOutlined)
export const CrownOutlined = withAccessibilityProps(AntdCrownOutlined)
export const ApartmentOutlined = withAccessibilityProps(AntdApartmentOutlined)
export const ColumnWidthOutlined = withAccessibilityProps(AntdColumnWidthOutlined)
export const FullscreenOutlined = withAccessibilityProps(AntdFullscreenOutlined)
export const FileOutlined = withAccessibilityProps(AntdFileOutlined)
export const FolderOpenOutlined = withAccessibilityProps(AntdFolderOpenOutlined)
export const FolderOutlined = withAccessibilityProps(AntdFolderOutlined)
export const CloudUploadOutlined = withAccessibilityProps(AntdCloudUploadOutlined)
export const PauseCircleOutlined = withAccessibilityProps(AntdPauseCircleOutlined)
export const ImportOutlined = withAccessibilityProps(AntdImportOutlined)
export const SnippetsOutlined = withAccessibilityProps(AntdSnippetsOutlined)
export const RadiusUpleftOutlined = withAccessibilityProps(AntdRadiusUpleftOutlined)
export const RadiusUprightOutlined = withAccessibilityProps(AntdRadiusUprightOutlined)
export const RadiusBottomrightOutlined = withAccessibilityProps(AntdRadiusBottomrightOutlined)
export const RadiusBottomleftOutlined = withAccessibilityProps(AntdRadiusBottomleftOutlined)
export const BorderOuterOutlined = withAccessibilityProps(AntdBorderOuterOutlined)
export const UnlockOutlined = withAccessibilityProps(AntdUnlockOutlined)
export const PictureOutlined = withAccessibilityProps(AntdPictureOutlined)
export const FieldTimeOutlined = withAccessibilityProps(AntdFieldTimeOutlined)
export const ExclamationCircleFilled = withAccessibilityProps(AntdExclamationCircleFilled)
export const ClearOutlined = withAccessibilityProps(AntdClearOutlined)
export const CaretDownFilled = withAccessibilityProps(AntdCaretDownFilled)
export const CaretDownOutlined = withAccessibilityProps(AntdCaretDownOutlined)
export const InfoOutlined = withAccessibilityProps(AntdInfoOutlined)
export const SwapOutlined = withAccessibilityProps(AntdSwapOutlined)
export const PartitionOutlined = withAccessibilityProps(AntdPartitionOutlined)
export const TranslationOutlined = withAccessibilityProps(AntdTranslationOutlined)
export const TableOutlined = withAccessibilityProps(AntdTableOutlined)
export const ArrowsAltOutlined = withAccessibilityProps(AntdArrowsAltOutlined)
export const ShrinkOutlined = withAccessibilityProps(AntdShrinkOutlined)
export const WifiOutlined = withAccessibilityProps(AntdWifiOutlined)
export const DesktopOutlined = withAccessibilityProps(AntDesktopOutlined)
export const BulbOutlined = withAccessibilityProps(AntdBulbOutlined)
export const CloudOutlined = withAccessibilityProps(AntdCloudOutlined)
export const SafetyOutlined = withAccessibilityProps(AntdSafetyOutlined)
export const Loading3QuartersOutlined = withAccessibilityProps(AntdLoading3QuartersOutlined)
export const CaretRightFilled = withAccessibilityProps(AntdCaretRightFilled)

export default withAccessibilityProps(AntdIcon)
