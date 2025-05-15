import { Space, Flex, Progress } from 'antd'
import cs from 'classnames'
import _ from 'lodash'
import styles from './ReportSummary.less'
import Page from '../../Page'
import jobIcon from '../../../assets/LearningJob.svg'
import collaborativeIcon from '../../../assets/CollaborativeLearning.svg'
import learningIcon from '../../../assets/FormalLearning.svg'
import aiIcon from '../../../assets/GenerativeAi.svg'
import customIcon from '../../../assets/Custom.svg'
import libIcon from '../../../assets/IDPLibrary.svg'
import { useAppSelector } from '~/modules/idpReport/hooks/redux'

const { I18n } = window

const COLORS = {
  blue: '#009DE0',
  green: '#00AC41',
  dark: '#565656',
}

const Card = ({ skill }) => {
  const actions = _.groupBy(skill.user_idp_development_actions,
    da => da.custom_action_learning_style || da.learning_style)

  const jobPercent = actions.on_the_job
    ? Math.round(_.sumBy(actions.on_the_job, 'progress') / actions.on_the_job.length) : 0
  const collaborativePercent = actions.learning_from_others
    ? Math.round(_.sumBy(actions.learning_from_others, 'progress') / actions.learning_from_others.length) : 0
  const structuredPercent = actions.structured_learning
    ? Math.round(_.sumBy(actions.structured_learning, 'progress') / actions.structured_learning.length) : 0

  const average = Math.round((jobPercent + collaborativePercent + structuredPercent) / 3)

  return (
    <div className={styles.card}>
      <Flex vertical gap={16}>
        <Flex justify="space-between" align="center">
          <Flex vertical>
            <div className={styles.title}>
              {skill.name}
            </div>
            <div className={styles.type}>
              {I18n.t(`idp.pdf.skill_categories.${skill.category}`)}
            </div>
          </Flex>
          <Progress
            className={styles.progressCircle}
            size={50}
            type="circle"
            strokeWidth={20}
            percent={average}
            strokeColor={{
              '0%': COLORS.blue,
              '100%': COLORS.green,
            }}
          />
        </Flex>
        <Flex vertical gap={10}>
          {actions.on_the_job && (
            <Flex vertical>
              <Flex align="end" justify="space-between" flex={1}>
                <div className={styles.label}>
                  {jobPercent}
                  %
                </div>
                <Flex gap={16} align="center">
                  <img src={jobIcon} className={styles.icon} />
                </Flex>
              </Flex>
              <Progress
                className={styles.progress}
                showInfo={false}
                type="line"
                size={['100%', 7]}
                percent={jobPercent}
                strokeColor={COLORS.blue}
              />
            </Flex>
          )}
          {actions.learning_from_others && (
            <Flex vertical justify="space-between">
              <Flex align="center" justify="space-between" flex={1}>
                <div className={styles.label}>
                  {collaborativePercent}
                  %
                </div>
                <Flex gap={16} align="center">
                  <img src={collaborativeIcon} className={styles.icon} />
                </Flex>
              </Flex>
              <Progress
                className={styles.progress}
                showInfo={false}
                type="line"
                size={['100%', 7]}
                percent={collaborativePercent}
                strokeColor={COLORS.green}
              />
            </Flex>
          )}
          {actions.structured_learning && (
            <Flex vertical justify="space-between">
              <Flex align="center" justify="space-between" flex={1}>
                <div className={styles.label}>
                  {structuredPercent}
                  %
                </div>
                <Flex gap={16} align="center">
                  <img src={learningIcon} className={styles.icon} />
                </Flex>
              </Flex>
              <Progress
                className={styles.progress}
                showInfo={false}
                type="line"
                size={['100%', 7]}
                percent={structuredPercent}
                strokeColor={COLORS.dark}
              />
            </Flex>
          )}
        </Flex>
      </Flex>
    </div>
  )
}

const ReportSummary = ({ rtl }) => {
  const idp = useAppSelector(state => state.idp.userIdp)
  const skills = idp.user_idp_skills

  const das = _.flatten(skills.map(skill => skill.user_idp_development_actions))
  const daTypes = _.groupBy(das, 'type')

  const chunks = _.chunk(skills, 6)

  return (
    <>
      {chunks.map((chunk, index) => (
        <Page rtl={rtl} key={index}>
          <div className={cs(styles.content)}>
            <Flex vertical style={{ height: '100%' }} justify="space-between">
              <Flex gap={20} vertical>
                <Flex justify="space-between" align="center">
                  <h1 className={styles.header}>
                    {I18n.t('idp.pdf.summary.title')}
                  </h1>
                  <Flex gap={16} align="center">
                    {I18n.t('idp.pdf.summary.current_status')}
                    <div className={cs(styles.statusBox, styles.active)}>{I18n.t('idp.pdf.statuses.not_reviewed')}</div>
                  </Flex>
                </Flex>
                <Flex gap={20} className={styles.counters}>
                  <Flex vertical className={cs(styles.count, styles.skillCount)} gap={16}>
                    <div className={styles.label}>{I18n.t('idp.pdf.summary.skills_count')}</div>
                    <div className={styles.num}>{skills.length}</div>
                  </Flex>
                  <Flex className={styles.daCounts} flex={1}>
                    <Flex className={styles.count} vertical gap={16}>
                      <div className={styles.label}>{I18n.t('idp.pdf.summary.da_count')}</div>
                      <div className={styles.num}>{das.length}</div>
                    </Flex>
                    <Flex className={styles.count} justify="space-between">
                      <Flex vertical gap={16}>
                        <div className={styles.label}>{I18n.t('idp.pdf.summary.custom_count')}</div>
                        <div className={styles.num}>{daTypes.custom_action?.length || 0}</div>
                      </Flex>
                      <img src={customIcon} className={styles.icon} />
                    </Flex>
                    <Flex className={styles.count} justify="space-between">
                      <Flex vertical gap={16}>
                        <div className={styles.label}>{I18n.t('idp.pdf.summary.ai_count')}</div>
                        <div className={styles.num}>{daTypes.ai_generated?.length || 0}</div>
                      </Flex>
                      <img src={aiIcon} className={styles.icon} />
                    </Flex>
                    <Flex className={styles.count} justify="space-between">
                      <Flex vertical gap={16}>
                        <div className={styles.label}>{I18n.t('idp.pdf.summary.lib_count')}</div>
                        <div className={styles.num}>{daTypes.library?.length || 0}</div>
                      </Flex>
                      <img src={libIcon} className={styles.icon} />
                    </Flex>
                  </Flex>
                </Flex>
                <Flex gap={20} wrap="wrap">
                  {chunk.map((skill, i) => (
                    <Card skill={skill} key={i} />
                  ))}
                </Flex>
              </Flex>
              <Flex justify="space-between" className={styles.footer}>
                <Flex align="center" gap={16}>
                  <div className={styles.label}>
                    {I18n.t('idp.pdf.summary.learn_pathway')}
                    :
                  </div>
                  <Space>
                    <img src={jobIcon} className={styles.icon} />
                    <div>
                      <strong>70%</strong>
                      {' '}
                      {I18n.t('idp.pdf.summary.learn_on_job')}
                    </div>
                  </Space>
                  <Space>
                    <img src={collaborativeIcon} className={styles.icon} />
                    <div>
                      <strong>20%</strong>
                      {' '}
                      {I18n.t('idp.pdf.summary.collaborative_learn')}
                    </div>
                  </Space>
                  <Space>
                    <img src={learningIcon} className={styles.icon} />
                    <div>
                      <strong>10%</strong>
                      {' '}
                      {I18n.t('idp.pdf.summary.formal_learn')}
                    </div>
                  </Space>
                </Flex>
                <Flex align="center" gap={16}>
                  <div className={styles.label}>
                    {I18n.t('idp.pdf.summary.created_by')}
                    :
                  </div>
                  <Space>
                    <img src={customIcon} className={styles.icon} />
                    <div>
                      {I18n.t('idp.pdf.summary.custom')}
                    </div>
                  </Space>
                  <Space>
                    <img src={aiIcon} className={styles.icon} />
                    <div>
                      {I18n.t('idp.pdf.summary.generated_ai')}
                    </div>
                  </Space>
                  <Space>
                    <img src={libIcon} className={styles.icon} />
                    <div>
                      {I18n.t('idp.pdf.summary.library')}
                    </div>
                  </Space>
                </Flex>
              </Flex>
            </Flex>
          </div>
        </Page>
      ))}
    </>
  )
}

export default ReportSummary
