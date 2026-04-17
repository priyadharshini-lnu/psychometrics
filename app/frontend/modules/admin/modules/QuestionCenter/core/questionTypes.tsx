import type { ElementType } from 'react'
import {
  FileTextOutlined,
  PictureOutlined,
  AuditOutlined,
  TableOutlined,
  EditOutlined,
  ColumnWidthOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  MenuUnfoldOutlined,
  CopyOutlined,
  LineChartOutlined,
  StarOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  AudioOutlined,
  FormOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  SafetyCertificateOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'

export interface QuestionTypeItem {
    type: string
    label: string
  icon: ElementType
    props?: Record<string, unknown>
    group?: string
}

export const QUESTION_TYPES: { group: string; items: QuestionTypeItem[] }[] = [
  {
    group: 'Static Content',
    items: [
      { type: 'Text', label: 'Descriptive Text', icon: FileTextOutlined },
      { type: 'Graphic', label: 'Graphic', icon: PictureOutlined },
    ],
  },
  {
    group: 'Standard Questions',
    items: [
      { type: 'MultipleChoice', label: 'Multiple Choice', icon: AuditOutlined },
      { type: 'MatrixTable', label: 'Matrix Table', icon: TableOutlined },
      { type: 'TextEntry', label: 'Text Entry', icon: EditOutlined },
      { type: 'Slider', label: 'Slider', icon: ColumnWidthOutlined },
      { type: 'RankOrder', label: 'Rank Order', icon: UnorderedListOutlined },
      { type: 'SideBySide', label: 'Side by Side', icon: AppstoreOutlined },
    ],
  },
  {
    group: 'Speciality Questions',
    items: [
      { type: 'ConstantSum', label: 'Constant Sum', icon: MenuUnfoldOutlined },
      { type: 'PickGroupRank', label: 'Pick, Group and Rank', icon: UnorderedListOutlined },
      { type: 'HotSpot', label: 'Hot Spot', icon: CopyOutlined },
      { type: 'GraphicSlider', label: 'Graphic Slider', icon: LineChartOutlined },
      { type: 'GapAnalysis', label: 'Gap Analysis', icon: StarOutlined },
      { type: 'VideoResponse', label: 'Video Response', icon: VideoCameraOutlined },
      { type: 'FileUpload', label: 'File Upload', icon: UploadOutlined },
      { type: 'AudioResponse', label: 'Audio Response', icon: AudioOutlined },
      { type: 'CampaignFactorFeedback', label: 'Campaign Factor Feedback', icon: FormOutlined },
      { type: 'FactorSelect', label: 'Factor Selection', icon: StarOutlined },
    ],
  },
  {
    group: 'Advanced',
    items: [
      { type: 'Timing', label: 'Timing', icon: ClockCircleOutlined },
      { type: 'MetaInfo', label: 'Meta Info Question', icon: InfoCircleOutlined },
      { type: 'Captcha', label: 'Captcha Verification', icon: SafetyCertificateOutlined },
    ],
  },
]

export const FLATTENED_QUESTION_TYPES: QuestionTypeItem[] = QUESTION_TYPES.flatMap(
  group => group.items.map(item => ({ ...item, group: group.group })),
)
