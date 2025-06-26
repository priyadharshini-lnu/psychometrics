import {
  Progress, Button, Flex, Typography, DatePicker,
  Tooltip,
} from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import useMedia from 'use-media'
import cs from 'classnames'
import dayjs from '~/utils/dayjs'
import styles from './DevelopmentActionLandscapeCard.less'
import { DevelopmentAction } from '~/components/IdpShared/DevelopmentActions/Types'
import { Tags } from '~/components/IdpShared/DevelopmentActions/Common'

const { RangePicker } = DatePicker

const { I18n } = window
type DevelopmentActionLandscapeCardProps = {
  editMode?: boolean
  onAddDevelopmentAction?: () => void
  onUpdateDevelopmentAction?: (developmentAction: Partial<DevelopmentAction>) => void
  onUpdateDevelopmentActionProgress?: (developmentAction: Pick<DevelopmentAction, 'id' | 'progress'>) => void
  onRemoveDevelopmentAction: (developmentAction: DevelopmentAction) => void
  name: string,
  developmentActions: Partial<DevelopmentAction>[]
}

export const DevelopmentActionLandscapeCard:
React.FC<DevelopmentActionLandscapeCardProps> = ({
  name,
  developmentActions,
  editMode,
  onAddDevelopmentAction,
  onUpdateDevelopmentAction,
  onRemoveDevelopmentAction,
}) => {
  const developmentActionCards = developmentActions.map(developmentAction => (
    <Card
      key={developmentAction.id}
      editMode={editMode}
      developmentAction={developmentAction}
      onUpdateDevelopmentAction={onUpdateDevelopmentAction}
      onRemoveDevelopmentAction={onRemoveDevelopmentAction}
    />
  ))

  return (
    <Flex vertical>
      <Flex
        justify="space-between"
        className={`${styles.border_b_1} ${styles.py_12}`}
      >
        <Flex gap={12}>
          <h4 className={`${styles.m_none} ${styles.heading}`}>{name}</h4>
        </Flex>
      </Flex>
      {developmentActionCards}
      {editMode ? (
        <Flex>
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={onAddDevelopmentAction}
            className={styles.p_none}
          >
            {I18n.t('idp.development_actions.add_development_action')}
          </Button>
        </Flex>
      ) : null}
    </Flex>
  )
}

const DateRange = ({ developmentAction, editMode, onDateRangeChange }) => {
  const { startDateTime, endDateTime } = developmentAction
  const format = 'DD MMM YYYY'
  if (editMode) {
    return (
      <Flex flex={1} vertical>
        <RangePicker
          defaultValue={[
            startDateTime ? dayjs(startDateTime) : null,
            endDateTime ? dayjs(endDateTime) : null,
          ]}
          format={format}
          disabledDate={current => current && current < dayjs().startOf('day')}
          onChange={onDateRangeChange}
        />
      </Flex>
    )
  }
  if (startDateTime && endDateTime) {
    return (
      <Flex flex={1}>
        <Typography.Text>
          {`${dayjs(startDateTime).format('DD MMM YYYY')} -
      ${dayjs(endDateTime).format('DD MMM YYYY')}`}
        </Typography.Text>
      </Flex>
    )
  }
  return (<Flex flex={1}>-</Flex>)
}

const Card = ({
  developmentAction,
  onUpdateDevelopmentAction,
  editMode,
  onRemoveDevelopmentAction,
}) => {
  const isTablet = useMedia({
    maxWidth: 768,
  })

  const handleDateRangeChange = (dates: [dayjs.Dayjs, dayjs.Dayjs] | undefined) => {
    const [start, end] = dates || []
    onUpdateDevelopmentAction?.({
      ...developmentAction,
      startDateTime: start ? dayjs(start).format('YYYY-MM-DD HH:mm') : null,
      endDateTime: end ? dayjs(end).format('YYYY-MM-DD HH:mm') : null,
    })
  }

  const progress = (
    <Flex
      flex={6}
      className={cs(
        {
          [styles.p_12]: !isTablet,
          [styles.pb_8]: isTablet,
        },
      )}
    >
      {isTablet ? (
        <Flex flex={1} className={styles.label}>
          {I18n.t('idp.development_actions.completion')}
        </Flex>
      ) : null}
      <Flex
        vertical
        flex={1}
        gap={4}
        justify="flex-start"
        align="flex-end"
      >
        <Progress percent={developmentAction.progress} className={styles.m_none} />
      </Flex>
    </Flex>
  )


  return (
    <Flex vertical>
      <Flex
        align="stretch"
        justify="space-between"
        className={styles.border_b_1}
        vertical={isTablet}
      >
        <Flex
          flex={5}
          className={cs(
            {
              [styles.border_r_1]: !isTablet,
              [styles.p_12]: !isTablet,
              [styles.pl_none]: !isTablet,
              [styles.pb_8]: isTablet,
            },
          )}
          justify="space-between"
          align="center"
        >
          <div>
            <Typography.Title
              level={5}
              ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
            >
              {developmentAction.name}
            </Typography.Title>
            <Typography.Paragraph
              ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
            >
              {developmentAction.description || developmentAction.customAction}
            </Typography.Paragraph>
            <Flex className={styles.mb_8}>
              {developmentAction.learningStyle || developmentAction.customActionLearningStyle
                ? <Tags type={developmentAction.learningStyle || developmentAction.customActionLearningStyle} />
                : null}
            </Flex>
          </div>
          {
            editMode && (
              <Tooltip title={I18n.t('idp.development_actions.remove')}>
                <Button
                  onClick={() => onRemoveDevelopmentAction(developmentAction)}
                  type="default"
                  shape="circle"
                  icon={<DeleteOutlined />}
                  danger
                />
              </Tooltip>
            )
          }
        </Flex>
        <Flex flex={5} vertical={isTablet}>
          <Flex
            flex={9}
            justify="flex-start"
            className={cs(
              {
                [styles.border_r_1]: !isTablet,
                [styles.p_12]: !isTablet,
                [styles.pb_8]: isTablet,
              },
            )}
          >
            {isTablet ? (
              <Flex flex={1} className={styles.label}>
                {I18n.t('idp.development_actions.date_range')}
              </Flex>
            ) : null}
            <DateRange
              onDateRangeChange={handleDateRangeChange}
              developmentAction={developmentAction}
              editMode={editMode}
            />
          </Flex>
          {progress}
        </Flex>
      </Flex>
    </Flex>
  )
}
