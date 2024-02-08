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
  let!(:user_assessment) { create(:user_assessment, campaign: campaign, evaluator: assessor.user) }
  let!(:workshop_subject) { create(:workshop_subject, workshop: workshop, campaign: campaign) }

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
              id: campaign.assessors.first.user_id
            },
            id: campaign_assessor_assessment.id
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

    it "creates new assessor record if assessor doesn't exist with user_id or campaign_id" do
      user = create(:user)
      params[:assessor_assessments][0][:assessor][:id] = user.id

      expect do
        described_class.call!(workshop_subject.id, campaign.id, params)
      end.to change { Assessor.count }.by(1)
    end

    it 'creates user_assessment if record doesnt exist with evalutor_id, subject_id, campaign_id or assessment_id' do
      params[:assessor_assessments][0][:assessor][:id] = create(:user).id

      expect do
        described_class.call!(workshop_subject.id, campaign.id, params)
      end.to change { UserAssessment.count }.by(1)
    end

    it 'create users_result record for users_assessment if it doesnt exist' do
      params[:assessor_assessments][0][:assessor][:id] = create(:user).id

      expect do
        described_class.call!(workshop_subject.id, campaign.id, params)
      end.to change { UsersResult.count }.by(1)
    end
  end
end
