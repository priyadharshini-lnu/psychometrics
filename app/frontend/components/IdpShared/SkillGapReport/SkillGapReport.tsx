import {
  useContext,
} from 'react'
import {
  Typography,
  Flex, Space,
} from 'antd'
import {
  ButtonWithArrow, MediaQueryContext, BackButton,
} from '~/glint'
import { DownloadButton } from '../DownloadButton'
import { Separator } from '../Separator'
import { SkillGapReportContent } from './SkillGapReportContent'


const { I18n } = window

export const SkillGapReport = ({
  next, skillGapData, reportUrl, isLoading, prev,
}) => {
  const { isMobile } = useContext(MediaQueryContext)

  const extraContent = (isLoading ? <></>
    : (
      reportUrl && (
        <DownloadButton
          disabled={skillGapData?.status !== 'prepared'}
          href={reportUrl}
          style={{ height: '2rem' }}
          className="me-2"
        >
          {I18n.t('idp.skill_gap_report.download')}
        </DownloadButton>
      )
    )
  )

  return (
    <>
      <Flex gap={8} vertical={isMobile} className="mt-4 mb-4" flex={1} justify="space-between">
        <Space>
          <BackButton
            onPrev={prev}
          />
          <Typography.Title
            className="mb-0 mt-0"
            level={3}
          >
            {I18n.t('idp.initial_steps.skill_gap_report')}
          </Typography.Title>
        </Space>
        <Flex gap={8} vertical={isMobile} justify="end" align="end">
          {extraContent}
          <ButtonWithArrow
            label={I18n.t('idp.initial_steps.add_skills_step')}
            type="primary"
            onClick={() => next()}
          />
        </Flex>
      </Flex>
      <Separator
        className="mb-4 mt-0"
      />
      <SkillGapReportContent skillGapData={skillGapData} isLoading={isLoading} />
    </>
  )
}
