# frozen_string_literal: true

require 'rails_helper'

describe WorkshopSubjects::BulkUpdateSubjects do
  let!(:workshop) { create(:workshop) }
  let!(:workshop_subject) { create(:workshop_subject, workshop: workshop) }
  let!(:workshop_subject2) { create(:workshop_subject, workshop: workshop) }
  let!(:user_assessment) { create(:user_assessment, campaign: workshop.campaign, subject: workshop_subject.user) }
  let!(:user_assessment2) do
    create(:user_assessment, campaign: workshop.campaign, subject: workshop_subject2.user,
                                   schedule_time: 'Fri, 04 Aug 2023 06:00:00.063000000 +04 +04:00')
  end

  describe '.call' do
    it 'schedule assessments' do
      user_assessment3 = create(:user_assessment, campaign: workshop.campaign, subject: workshop_subject.user,
                                schedule_time: '2023-08-04T03:00:00.063Z', schedule_updated: true)
      user_assessment4 = create(:user_assessment, campaign: workshop.campaign, subject: workshop_subject2.user)
      data = {
        subject_ids: [workshop_subject.id, workshop_subject2.id],
        assessments: [
          {
            assessment_id: user_assessment.assessment_id,
            action: 'schedule',
            time: '2023-08-04T02:00:00.063Z'
          },
          {
            assessment_id: user_assessment2.assessment_id,
            action: 'unschedule',
            time: nil
          },
          {
            assessment_id: user_assessment3.assessment_id,
            action: 'unschedule',
            time: nil
          },
          {
            assessment_id: user_assessment4.assessment_id,
            action: 'schedule',
            time: '2023-08-04T01:00:00.063Z'
          }
        ]
      }

      expect(user_assessment2.schedule_time).to eq('Fri, 04 Aug 2023 06:00:00.063000000 +04 +04:00')
      described_class.call!(workshop, data)
      expect(user_assessment.reload.schedule_time).to eq('Fri, 04 Aug 2023 06:00:00.063000000 +04 +04:00')
      expect(user_assessment2.reload.schedule_time).to eq(nil)
      expect(user_assessment3.reload.schedule_time).to eq('2023-08-04 07:00:00.063000000 +0400')
      expect(user_assessment4.reload.schedule_time).to eq('Fri, 04 Aug 2023 05:00:00.063000000 +04 +04:00')
    end

    it 'do not overide exists' do
      user_assessment3 = create(:user_assessment, campaign: workshop.campaign, subject: workshop_subject.user,
                                schedule_time: 'Fri, 04 Aug 2023 06:00:00.063000000 +04 +04:00',
                                schedule_updated: true)
      data = {
        subject_ids: [workshop_subject.id, workshop_subject2.id],
        assessments: [
          {
            assessment_id: user_assessment3.assessment_id,
            action: 'schedule',
            time: '2023-08-04T01:00:00.063Z'
          }
        ],
        override_existing: false
      }

      described_class.call!(workshop, data)
      expect(user_assessment3.reload.schedule_time).to eq('Fri, 04 Aug 2023 06:00:00.063000000 +04 +04:00')
    end

    it 'overide exists' do
      user_assessment3 = create(:user_assessment, campaign: workshop.campaign, subject: workshop_subject.user,
                                schedule_time: 'Fri, 04 Aug 2023 06:00:00.063000000 +04 +04:00',
                                schedule_updated: true)
      data = {
        subject_ids: [workshop_subject.id, workshop_subject2.id],
        assessments: [
          {
            assessment_id: user_assessment3.assessment_id,
            action: 'schedule',
            time: '2023-08-04T01:00:00.063Z'
          }
        ],
        override_existing: true
      }

      described_class.call!(workshop, data)
      expect(user_assessment3.reload.schedule_time).to eq('Fri, 04 Aug 2023 05:00:00.063000000 +04 +04:00')
    end
  end

  describe 'with override true' do
    it 'schedule multiple assessments' do
      user_assessment3 = create(:user_assessment, campaign: workshop.campaign, subject: workshop_subject.user)
      user_assessment4 = create(:user_assessment, campaign: workshop.campaign, subject: workshop_subject2.user)
      data = {
        subject_ids: [workshop_subject.id, workshop_subject2.id],
        assessments: [
          {
            assessment_id: user_assessment.assessment_id,
            action: 'schedule',
            time: '2023-08-04T02:00:00.063Z'
          },
          {
            assessment_id: user_assessment2.assessment_id,
            action: 'unschedule',
            time: nil
          },
          {
            assessment_id: user_assessment3.assessment_id,
            action: 'schedule',
            time: '2023-08-04T03:00:00.063Z'
          },
          {
            assessment_id: user_assessment4.assessment_id,
            action: 'schedule',
            time: '2023-08-04T01:00:00.063Z'
          }
        ],
        override_existing: true
      }

      expect(user_assessment2.schedule_time).to eq('Fri, 04 Aug 2023 06:00:00.063000000 +04 +04:00')
      expect(user_assessment2.schedule_updated).to eq(false)

      described_class.call!(workshop, data)
      expect(user_assessment.reload.schedule_time).to eq('2023-08-04 06:00:00.063000000 +0400')
      expect(user_assessment2.schedule_updated).to eq(false)
      expect(user_assessment3.reload.schedule_time).to eq('Fri, 04 Aug 2023 07:00:00.063000000 +04 +04:00')
      expect(user_assessment3.schedule_updated).to eq(true)
      expect(user_assessment4.reload.schedule_time).to eq('Fri, 04 Aug 2023 05:00:00.063000000 +04 +04:00')
      expect(user_assessment4.schedule_updated).to eq(true)
    end
  end
end
