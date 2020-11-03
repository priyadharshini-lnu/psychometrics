import React, { useRef } from 'react'
import { CampaignAssessment } from 'modules/admin/modules/campaigns/core/assessmentGroups/interfaces'
import { MenuOutlined } from '@ant-design/icons'
import { XYCoord } from 'dnd-core'
import {
  useDrop, useDrag, DropTargetMonitor, DragSourceMonitor,
} from 'react-dnd'
import styles from './styles.scss'
import { PropsFromRedux } from './connect'

interface Props {
  assessment: CampaignAssessment
}

interface DragAssessment {
  id: number
  position: number
  campaignId: number
  groupId: number
  type: string
}

const Assessment: React.FC<Props & PropsFromRedux> = ({ assessment, updateAssessment, attachAssessmentToGroup }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [, drop] = useDrop({
    accept: 'ASSESSMENT',
    hover (item: DragAssessment, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return
      }
      const dragPosition = item.position
      const hoverPosition = assessment.position

      // Don't replace items with themselves
      if (dragPosition === hoverPosition) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      if (assessment.campaignAssessmentGroupId === item.groupId) {
      // Dragging downwards
        if (dragPosition < hoverPosition && hoverClientY < hoverMiddleY / 2) {
          return
        }

        // Dragging upwards
        if (dragPosition > hoverPosition && hoverClientY > hoverMiddleY * 1.8) {
          return
        }

        // Time to actually perform the action
        updateAssessment(assessment.campaignId, assessment.id, { position: dragPosition })
        updateAssessment(item.campaignId, item.id, { position: hoverPosition })

        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        item.position = hoverPosition
        return
      }

      item.groupId = assessment.campaignAssessmentGroupId
      item.position = hoverPosition

      attachAssessmentToGroup(item.campaignId, item.id, assessment.campaignAssessmentGroupId, hoverPosition)
    },
  })
  const [{ isDragging }, source, drag] = useDrag({
    end: (item: DragAssessment | undefined, monitor: DragSourceMonitor) => {
      const dropResult = monitor.getDropResult()
      if (item && dropResult && (dropResult.groupId || dropResult.groupId === null)) {
        updateAssessment(item.campaignId, item.id, { campaignAssessmentGroupId: dropResult.groupId, position: 1 })
      }
    },
    item: {
      type: 'ASSESSMENT',
      id: assessment.id,
      position: assessment.position,
      campaignId: assessment.campaignId,
      groupId: assessment.campaignAssessmentGroupId,
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })
  const opacity = isDragging ? 0.4 : 1
  drag(drop(ref))

  return (
    <div ref={ref} style={{ opacity }} className={styles.container}>
      <span ref={source} className={styles.icon}>
        <MenuOutlined />
      </span>
      <span className={styles.id}>{assessment.assessmentId}</span>
      <span className={styles.name}>{assessment.name}</span>
    </div>
  )
}

export default Assessment
