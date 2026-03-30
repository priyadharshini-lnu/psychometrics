import { Flex, Progress, Rate } from 'antd'
import cs from 'classnames'
import _ from 'lodash'
import styles from './IDP.less'
import jobIcon from '../../../assets/LearningJob.svg'
import collaborativeIcon from '../../../assets/CollaborativeLearning.svg'
import learningIcon from '../../../assets/FormalLearning.svg'
import aiIcon from '../../../assets/GenerativeAi.svg'
import customIcon from '../../../assets/Custom.svg'
import libIcon from '../../../assets/IDPLibrary.svg'
import dayjs from '~/utils/dayjs'
import { useI18n } from '~/modules/idpReport/I18nContext'
import { DevelopmentActionSourceType } from '~/components/IdpShared/DevelopmentActions/Constants'

const COLORS = {
  on_the_job: '#009DE0',
  learning_from_others: '#00AC41',
  structured_learning: '#565656',
}

const LEARN_STYLE_ICONS = {
  on_the_job: jobIcon,
  learning_from_others: collaborativeIcon,
  structured_learning: learningIcon,
}

const TYPE_ICONS = {
  [DevelopmentActionSourceType.AI_GENERATED]: aiIcon,
  [DevelopmentActionSourceType.PLATFORM]: libIcon,
  [DevelopmentActionSourceType.CUSTOM]: customIcon,
}


export const Skill = ({
  skill, developmentActions, sectionTitleStyle, sectionSubtitleStyle, sectionBodyStyle,
}) => {
  const das = _.groupBy(developmentActions, da => da.learning_style)
  const I18n = useI18n()
  return (
    <div className={styles.skill} data-skill-id={skill.id}>
      <Flex vertical gap={16}>
        <Flex className={styles.header} justify="space-between" align="center">
          <h2 className={styles.title} style={sectionTitleStyle}>
            {skill.name}
          </h2>
          <Flex gap={12} align="center">
            <div className={styles.subtitle} style={sectionBodyStyle}>
              {I18n.t('idp.pdf.idp.self_rating')}
            </div>
            <Rate allowHalf value={skill.initial_rating} style={{ fontSize: 18 }} />
          </Flex>
        </Flex>
        {das.on_the_job?.map((da, i) => (
          <DevelopmentAction
            key={i}
            developmentAction={da}
            sectionSubtitleStyle={sectionSubtitleStyle}
            sectionBodyStyle={sectionBodyStyle}
          />
        ))}
        {das.learning_from_others?.map((da, i) => (
          <DevelopmentAction
            key={i}
            developmentAction={da}
            sectionSubtitleStyle={sectionSubtitleStyle}
            sectionBodyStyle={sectionBodyStyle}
          />
        ))}
        {das.structured_learning?.map((da, i) => (
          <DevelopmentAction
            key={i}
            developmentAction={da}
            sectionSubtitleStyle={sectionSubtitleStyle}
            sectionBodyStyle={sectionBodyStyle}
          />
        ))}
      </Flex>
    </div>
  )
}


const DevelopmentAction = ({ developmentAction, sectionSubtitleStyle, sectionBodyStyle }) => {
  const I18n = useI18n()

  const learnStyle = developmentAction.learning_style
  const color = COLORS[learnStyle]
  const icon = LEARN_STYLE_ICONS[learnStyle]
  const customIcon = TYPE_ICONS[developmentAction.source_type]

  return (
    <Flex className={styles.developAction} align="center" data-development-action-id={developmentAction.id}>

      <div className={cs(styles.description)} style={{ borderColor: color, ...sectionBodyStyle }}>
        <div className={styles.name} style={sectionSubtitleStyle}>{developmentAction.name}</div>
        {developmentAction.description}
      </div>

      <Flex vertical flex={1} gap={8}>
        <Flex justify="space-between">
          <div className={styles.date} style={sectionBodyStyle}>
            {I18n.t('idp.pdf.idp.start_date')}
            {' '}
            {developmentAction.start_date_time
              ? (
                <strong style={sectionBodyStyle}>
                  {dayjs(developmentAction.start_date_time).format('DD MMM YYYY')}
                </strong>
              )
              : null
            }
          </div>
          <div className={styles.date} style={sectionBodyStyle}>
            {I18n.t('idp.pdf.idp.end_date')}
            {' '}
            {developmentAction.end_date_time
              ? (
                <strong style={sectionBodyStyle}>
                  {dayjs(developmentAction.end_date_time).format('DD MMM YYYY')}
                </strong>
              )
              : null
            }
          </div>
        </Flex>
        <Flex gap={12} align="center">
          <img src={icon} className={cs(styles.icon)} />
          <img src={customIcon} className={cs(styles.icon, styles.small)} />
          <Progress
            className={styles.progress}
            showInfo={false}
            type="line"
            size={['100%', 7]}
            percent={developmentAction.progress}
            strokeColor="#0B0B0B"
          />
          <div className={styles.progressInfo} style={sectionBodyStyle}>
            {developmentAction.progress}
            %
          </div>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default DevelopmentAction
