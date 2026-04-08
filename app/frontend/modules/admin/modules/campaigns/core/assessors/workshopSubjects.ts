import * as t from 'io-ts'

const WorkshopActivityEvaluatorTR = t.type({
  id: t.string,
  fullName: t.string,
  email: t.string,
})

const WorkshopActivityTR = t.partial({
  name: t.string,
  status: t.string,
  scheduleTime: t.union([t.string, t.null]),
  evaluator: t.union([WorkshopActivityEvaluatorTR, t.null]),
  linkedSubjectMeetingLink: t.union([t.string, t.null]),
})

export type WorkshopActivity = t.TypeOf<typeof WorkshopActivityTR>

export const ParticipantSubjectTR = t.type({
  id: t.string,
  fullName: t.union([t.string, t.null]),
  email: t.union([t.string, t.null]),
  photoUrl: t.union([t.string, t.null]),
  campaign: t.type({
    id: t.string,
    name: t.string,
    projectId: t.number,
  }),
  workshopId: t.union([t.number, t.null]),
  workshopName: t.union([t.string, t.null]),
  workshopStartTime: t.union([t.string, t.null]),
  schedulingStatus: t.string,
  attendanceStatus: t.string,
  attended: t.boolean,
  duration: t.number,
  preworks: t.union([t.string, t.null]),
  meetingLink: t.union([t.string, t.null]),
  workshopActivities: t.union([t.array(WorkshopActivityTR), t.string, t.null]),
})

export type ParticipantSubject = t.TypeOf<typeof ParticipantSubjectTR>

const FilterOptionTR = t.type({ id: t.union([t.string, t.number]), name: t.string })
const StatusFilterOptionTR = t.type({ value: t.string, label: t.string })

export const MetadataForFiltersTR = t.type({
  campaigns: t.array(FilterOptionTR),
  slotNames: t.array(FilterOptionTR),
  attendanceStatuses: t.array(StatusFilterOptionTR),
  schedulingStatuses: t.array(StatusFilterOptionTR),
})
