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

const { I18n } = window
I18n.locale = document.body.getAttribute('data-locale')

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
  ai_generated: aiIcon,
  library: libIcon,
  custom_action: customIcon,
}


export const Skill = ({ skill, developmentActions }) => {
  const das = _.groupBy(developmentActions, da => da.custom_action_learning_style || da.learning_style)

  return (
    <div className={styles.skill}>
      <Flex vertical gap={16}>
        <Flex className={styles.header} justify="space-between" align="center">
          <h2 className={styles.title}>
            {skill.name}
          </h2>
          <Flex gap={12} align="center">
            <div className={styles.subtitle}>
              {I18n.t('idp.pdf.idp.self_rating')}
            </div>
            <Rate allowHalf value={skill.initial_rating} style={{ fontSize: 18 }} />
          </Flex>
        </Flex>
        {das.on_the_job?.map((da, i) => <DevelopmentAction key={i} developmentAction={da} />)}
        {das.learning_from_others?.map((da, i) => <DevelopmentAction key={i} developmentAction={da} />)}
        {das.structured_learning?.map((da, i) => <DevelopmentAction key={i} developmentAction={da} />)}
      </Flex>
    </div>
  )
}


const DevelopmentAction = ({ developmentAction }) => {
  const learnStyle = developmentAction.custom_action_learning_style || developmentAction.learning_style
  const color = COLORS[learnStyle]
  const icon = LEARN_STYLE_ICONS[learnStyle]
  const customIcon = TYPE_ICONS[developmentAction.type]

  return (
    <Flex className={styles.developAction} align="center">
      <div className={cs(styles.description)} style={{ borderColor: color }}>
        {developmentAction.custom_action || developmentAction.name}
      </div>

      <Flex vertical flex={1} gap={8}>
        <Flex justify="space-between">
          <div className={styles.date}>
            {I18n.t('idp.pdf.idp.start_date')}
            {' '}
            <strong>{dayjs(developmentAction.start_date_time).format('DD MMM YYYY')}</strong>
          </div>
          <div className={styles.date}>
            {I18n.t('idp.pdf.idp.end_date')}
            {' '}
            <strong>{dayjs(developmentAction.end_date_time).format('DD MMM YYYY')}</strong>
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
          <div className={styles.progressInfo}>
            {developmentAction.progress}
            %
          </div>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default DevelopmentAction
