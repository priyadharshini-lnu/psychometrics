# frozen_string_literal: true

require 'rails_helper'

describe WorkshopSubjects::UpdateSubjectData do
  let!(:workshop) { create(:workshop) }
  let!(:campaign) { create(:campaign) }
  let!(:campaign_assessment) { create(:campaign_assessment, campaign: campaign) }
  let!(:campaign_assessor_assessment) do
    create(:campaign_assessor_assessment, campaign: campaign, assessment: campaign_assessment.assessment)
  end
  let!(:relationship) { create(:relationship, name: 'Assessor', type: :global) }
  let!(:assessor) { create(:assessor, campaign: campaign) }
  let!(:workshop_subject) { create(:workshop_subject, workshop: workshop, campaign: campaign) }
  let!(:user_assessment) do
    create(
      :user_assessment, campaign: campaign, evaluator: assessor.user, relationship: relationship,
      assessment: campaign_assessment.assessment, subject: workshop_subject.user
    )
  end

  describe '.call' do
    let(:params) do
      {
        attendance_status: 'dropped_out',
        late_duration: 10,
        assessments: [
          {
            id: user_assessment.id,
            schedule_time: '2023-08-04T02:00:00.063Z'
          }
        ],
        assessor_assessments: [
          {
            assessor: {
              id: campaign.assessors.first.user_id,
              user_id: campaign.assessors.first.user_id,
              name: campaign.assessors.first.user.name,
              photo_url: nil
            },
            id: user_assessment.id,
            schedule_time: '2023-08-04T02:00:00.063Z'
          }
        ]
      }
    end

    it 'update subject data' do
      described_class.call!(workshop_subject.id, campaign.id, params)

      expect(workshop_subject.reload.attendance_status).to eq('dropped_out')
      expect(workshop_subject.reload.late_duration).to eq(10)
      user_assessment.reload
      expect(user_assessment.schedule_time).to eq('2023-08-04T02:00:00.063Z')
      expect(user_assessment.evaluator_id).to eq(campaign.assessors.first.user_id)
    end

    it 'updates existing assessor_user_assessment with matching id in params' do
      described_class.call!(workshop_subject.id, campaign.id, params)

      expect(user_assessment.reload.schedule_time).to eq('2023-08-04T02:00:00.063Z')
    end

    it 'creates new assessor_user_assessment record if campaign_assessor_assessment_id present in params' do
      new_campaign_assessor_assessment = create(:campaign_assessor_assessment, campaign: campaign)
      params[:assessor_assessments] << {
        campaign_assessor_assessment_id: new_campaign_assessor_assessment.id,
        schedule_time: '2023-08-04T02:00:00.063Z',
        assessment_id: new_campaign_assessor_assessment.assessment_id,
        assessor: {
          id: campaign.assessors.first.user_id,
          user_id: campaign.assessors.first.user_id,
          name: campaign.assessors.first.user.name,
          photo_url: nil
        }
      }
      expect do
        described_class.call!(workshop_subject.id, campaign.id, params)
      end.to change { UserAssessment.count }.by(1).and change { UsersResult.count }.by(1)
      expect(UserAssessment.last.assessment_id).to eq(new_campaign_assessor_assessment.assessment_id)
      expect(UserAssessment.last.evaluator_id).to eq(campaign.assessors.first.user_id)
      expect(UserAssessment.last.schedule_time).to eq('2023-08-04T02:00:00.063Z')
      expect(UserAssessment.last.relationship_id).to eq(relationship.id)
    end

    it 'removes assessor_user_assessment records not included in the params during the delete operation' do
      user_assessment_to_delete = create(
        :user_assessment, campaign: campaign, evaluator: assessor.user, relationship: relationship,
        assessment: campaign_assessment.assessment, subject: workshop_subject.user
      )
      params[:assessor_assessments] = [
        {
          id: user_assessment.id,
          schedule_time: '2023-08-04T02:00:00.063Z'
        }
      ]

      expect do
        described_class.call!(workshop_subject.id, campaign.id, params)
      end.to change { UserAssessment.count }.by(-1).and change { UsersResult.count }.by(-1)

      expect(UserAssessment.exists?(user_assessment.id)).to be true
      expect(UserAssessment.exists?(user_assessment_to_delete.id)).to be false
    end
  end
end
