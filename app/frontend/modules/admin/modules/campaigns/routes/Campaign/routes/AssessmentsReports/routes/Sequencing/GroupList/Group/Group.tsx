import React, { useRef } from 'react'
import { CampaignAssessmentGroup } from 'modules/admin/modules/campaigns/core/assessmentGroups/interfaces'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd'
import { Switch, Popconfirm } from 'antd'
import { XYCoord } from 'dnd-core'
import Assessment from '../../Assessment'
import styles from './styles.scss'
import { PropsFromRedux } from './connect'
import AssessmentsDropArea from '../../AssessmentsDropArea'

const { I18n } = window

interface OwnProps {
  group: CampaignAssessmentGroup
}


interface DragGroup {
  id: number
  position: number
  campaignId: number
  type: string
}

type Props = PropsFromRedux & OwnProps

const Group: React.FC<Props> = ({
  group, remove, openModal, update, assessments,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const [, drop] = useDrop({
    accept: 'GROUP',
    hover (item: DragGroup, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return
      }
      const dragPosition = item.position
      const hoverPosition = group.position

      // Don't replace items with themselves
      if (dragPosition === hoverPosition) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical quoter
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 4

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 25%
      // When dragging upwards, only move when the cursor is above 25%

      // Dragging downwards
      if (dragPosition < hoverPosition && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragPosition > hoverPosition && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      update(group.campaignId, group.id, { position: dragPosition })
      update(item.campaignId, item.id, { position: hoverPosition })

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.position = hoverPosition
    },
  })

  const [{ isDragging }, source, drag] = useDrag({
    item: {
      type: 'GROUP', id: group.id, position: group.position, campaignId: group.campaignId,
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })
  const opacity = isDragging ? 0.4 : 1
  drag(drop(ref))

  return (
    <div ref={ref} style={{ opacity }} className={styles.container}>
      <div className="display-flex mb24">
        <div className={styles.id}>{group.position}</div>
        <div ref={source} className={styles.title}>{group.name}</div>
        <span
          className={styles.icon}
          onClick={() => openModal('GroupFormModal', { campaignId: group.campaignId, group })}
        >
          <EditOutlined />
        </span>
        <span className={styles.icon}>
          <Popconfirm
            title={I18n.t('frontend.are_you_sure')}
            onConfirm={() => remove(group)}
            okText={I18n.t('frontend.yes')}
            cancelText={I18n.t('frontend.no')}
          >
            <DeleteOutlined />
          </Popconfirm>

        </span>
      </div>
      <div className={styles.switch}>
        <Switch
          checked={group.previousAssessmentsRequired}
          onChange={(checked) => { update(group.campaignId, group.id, { previousAssessmentsRequired: checked }) }}
        />
        {'  '}
        <span>{I18n.t('assessments_reports.add_group_form.previous_assessments_required')}</span>
      </div>
      <div className={styles.switch}>
        <Switch
          checked={group.previousGroupRequired}
          onChange={(checked) => { update(group.campaignId, group.id, { previousGroupRequired: checked }) }}
        />
        {'  '}
        <span>{I18n.t('assessments_reports.add_group_form.previous_group_required')}</span>
      </div>
      <div className="mt24">
        {
        assessments.length
          ? assessments.map(assessment => <Assessment key={assessment.id} assessment={assessment} />)
          : <AssessmentsDropArea groupId={group.id} text={I18n.t('assessments_reports.sequencing.no_assessments')} />

        }
      </div>
    </div>
  )
}

export default Group
