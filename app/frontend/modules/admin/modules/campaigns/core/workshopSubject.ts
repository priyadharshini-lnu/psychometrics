import * as t from 'io-ts'

export const AssessorTR = t.type({
  id: t.string,
  name: t.string,
  userId: t.union([t.string, t.null]),
  photoUrl: t.union([t.string, t.null]),
})

export const WorkshopTR = t.type({
  id: t.string,
  name: t.string,
  startTime: t.string,
})

export const WorkshopSubjectTR = t.type({
  id: t.string,
  attendanceStatus: t.string,
  schedulingStatus: t.string,
  language: t.union([t.string, t.null]),
  lateDuration: t.union([t.number, t.null]),
  preworks: t.string,
  attended: t.boolean,
  workshopActivities: t.string,
  user: t.union([
    t.type({
      id: t.string,
      fullName: t.union([t.string, t.null]),
      email: t.union([t.string, t.null]),
    }),
    t.undefined]),
})

export const AssessorUserAssessmentTR = t.type({
  id: t.string,
  name: t.string,
  status: t.union([t.string, t.null]),
  assessmentId: t.number,
  scheduleTime: t.union([t.string, t.null, t.undefined]),
  meetingLink: t.union([t.string, t.null]),
  meetingType: t.union([t.string, t.null]),
  linkedActivityId: t.union([t.string, t.null]),
  assessor: t.union([AssessorTR, t.null]),
  source: t.union([t.string, t.null]),
})

export const CampaignAssessorAssessmentTR = AssessorUserAssessmentTR

export const EditableWorkshopSubjectTR = t.type({
  id: t.string,
  attendanceStatus: t.string,
  completionStatus: t.string,
  attended: t.boolean,
  preworks: t.string,
  workshopActivities: t.string,
  lateDuration: t.union([t.number, t.null]),
  language: t.union([t.string, t.null]),
  schedulingStatus: t.string,
  user: t.union([
    t.type({
      fullName: t.union([t.string, t.null]),
      email: t.union([t.string, t.null]),
      photoUrl: t.union([t.string, t.null]),
    }),
    t.undefined]),
  workshop: t.union([
    WorkshopTR,
    t.undefined]),
  meta: t.type({
    assessors: t.array(AssessorTR),
    assessorAssessments: t.array(t.type({
      id: t.string,
      name: t.string,
    })),
  }),
})

export const Schema = {
  type: 'workshop_subjects',
  relationships: {
    user: {
      type: 'users',
    },
    workshop: {
      type: 'workshops',
    },
  },
}

export type WorkshopSubject = t.TypeOf<typeof WorkshopSubjectTR>

export type EditableWorkshopSubject = t.TypeOf<typeof EditableWorkshopSubjectTR>

export const SubjectAssessmentTR = t.type({
  id: t.string,
  name: t.string,
  status: t.string,
  scheduleTime: t.union([t.string, t.null, t.undefined]),
  assessment: t.type({
    id: t.string,
  }),
})

export type Workshop = t.TypeOf<typeof WorkshopTR>

export type Assessor = t.TypeOf<typeof AssessorTR>

export type SubjectUserAssessment = t.TypeOf<typeof SubjectAssessmentTR>

export type AssessorUserAssessment = t.TypeOf<typeof AssessorUserAssessmentTR>

export type CampaignAssessorAssessment = t.TypeOf<typeof CampaignAssessorAssessmentTR>
