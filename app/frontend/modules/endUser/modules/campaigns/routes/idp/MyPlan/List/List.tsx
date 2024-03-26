import {
} from 'antd'
import { DevelopmentActionListView } from '~/components/IdpShared/DevelopmentActions'

export const IdpData = [
  {
    id: 1,
    category: 'Behavioural',
    skills: [
      {
        id: 1,
        name: 'Strategic Thinker',
        rating: 4,
        description: `Take on a challenging taskTake on a challenging task.
         and observe how you are made to make several decisions along the way,
          reflect and review them as they're on-going and implement necessary changes.`,
        durationType: 'Marathon (12 months)',
        durationNumber: 70,
        progress: 20,
        startDate: '2023-10-31T10:10:00.000+04:00',
        endDate: '2023-10-31T10:10:00.000+04:00',
        isPrivate: true,
      },
      {
        id: 2,
        name: 'Learning Agility',
        rating: 4,
        description: `Take on a challenging taskTake on a challenging task.
         and observe how you are made to make several decisions along the way,
          reflect and review them as they're on-going and implement necessary changes.`,
        durationType: 'Marathon (12 months)',
        durationNumber: 70,
        progress: 0,
        startDate: '2023-10-31T10:10:00.000+04:00',
        endDate: '2023-10-31T10:10:00.000+04:00',
        isPrivate: true,
      },
      {
        id: 3,
        name: 'Impactful Decision-Maker',
        rating: 4,
        description: `Take on a challenging taskTake on a challenging task.
         and observe how you are made to make several decisions along the way,
          reflect and review them as they're on-going and implement necessary changes.`,
        durationType: 'Marathon (12 months)',
        durationNumber: 70,
        progress: 100,
        startDate: '2023-10-31T10:10:00.000+04:00',
        endDate: '2023-10-31T10:10:00.000+04:00',
        isPrivate: true,
      },
      {
        id: 4,
        name: 'Impactful Decision-Maker',
        rating: 3,
        description: `Establish a decision-making process to minimise biases and'
        errors that may arise during any task completion. With a proven process in place, you can expedite the
         decision-making without needing to determine the steps each time.`,
        durationType: 'Sprint (6 months)',
        durationNumber: 20,
        progress: 35,
        startDate: '2023-10-31T10:10:00.000+04:00',
        endDate: '2023-10-31T10:10:00.000+04:00',
        isPrivate: false,
      },
    ],
  },
  {
    id: 2,
    category: 'Strategic',
    skills: [
      {
        id: 5,
        name: 'Strategic Thinker',
        rating: 3,
        description: 'Take on a challenging task...',
        durationType: 'Marathon (12 months)',
        durationNumber: 10,
        progress: 20,
        startDate: '2023-10-31T10:10:00.000+04:00',
        endDate: '2023-10-31T10:10:00.000+04:00',
        isPrivate: true,
      },
      {
        id: 6,
        name: 'Impactful Decision-Maker',
        rating: 3,
        description: 'Use tools such as the SWOT diagram...',
        durationType: 'Sprint (6 months)',
        durationNumber: 20,
        progress: 35,
        startDate: '2023-10-31T10:10:00.000+04:00',
        endDate: '2023-10-31T10:10:00.000+04:00',
        isPrivate: false,
      },
    ],
  },
]


export const List = () => {
  const handleAddDevelopmentAction = () => {
    // call api here
  }

  return (
    <>
      <DevelopmentActionListView categories={IdpData} onAddDevelopmentAction={handleAddDevelopmentAction} />
    </>
  )
}
