import * as t from 'io-ts'

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
      fullName: t.union([t.string, t.null]),
      email: t.union([t.string, t.null]),
    }),
    t.undefined]),
})

export const AssessorAssessmentTR = t.type({
  id: t.string,
  name: t.string,
  userAssessmentId: t.union([t.number, t.null]),
  status: t.union([t.string, t.null]),
  scheduleTime: t.union([t.string, t.null, t.undefined]),
  meetingLink: t.union([t.string, t.null]),
  linkedActivity: t.union([t.string, t.null]),
  assessor: t.union([
    t.type({
      id: t.string,
      name: t.string,
      photoUrl: t.union([t.string, t.null]),
    }),
    t.null]),
})

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
    t.type({
      id: t.string,
      name: t.string,
      startTime: t.string,
    }),
    t.undefined]),
  meta: t.type({
    assessors: t.array(t.type({
      id: t.string,
      name: t.string,
      userId: t.union([t.string, t.null]),
      photoUrl: t.union([t.string, t.null]),
    })),
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
})

export type SubjectAssessment = t.TypeOf<typeof SubjectAssessmentTR>

export type AssessorAssessment = t.TypeOf<typeof AssessorAssessmentTR>
