# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::Assessors::UserAssessmentsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:assessor) { create(:assessor) }
  let(:campaign) { assessor.campaign }
  let!(:user_assessment) { create(:user_assessment, evaluator: assessor.user, campaign: campaign) }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'GET index' do
    it 'lists user_assessment' do
      get :index, params: { new_campaign_id: assessor.campaign_id, assessor_id: assessor.id }, format: :json

      parsed_response = response.parsed_body

      expect(parsed_response['total']).to eq(1)
      expect(parsed_response['list']).to eq([{
        'id' => user_assessment.id,
        'assessment_name' => user_assessment.assessment.name,
        'status' => user_assessment.users_result.status,
        'subject_email' => user_assessment.subject.email,
        'subject_name' => user_assessment.subject.decorate.full_name,
        'permissions' => { 'reset_evaluation' => true, 'reset_progress' => true, 'rescore' => true }
      }])
    end
  end

  describe 'PUT create' do
    it "doesn't create user_assessment when params are not valid" do
      create(:relationship, name: 'Assessor', type: :global)
      subject = create(:user)

      put :create, params: {
        new_campaign_id: assessor.campaign_id,
        assessor_id: assessor.id,
        resource: {
          subject_id: subject.id
        }
      }, format: :json

      user_assessment = assessor.user_assessments.find_by(campaign: campaign.id, subject: subject)
      parsed_response = response.parsed_body

      expect(user_assessment).to eq(nil)
      expect(response.status).to eq(422)
      expect(parsed_response).to eq({ 'errors' => { 'assessment_id' => ["can't be blank"] } })
    end

    it 'creates user_asssessment when params are valids' do
      create(:relationship, name: 'Assessor', type: :global)
      subject = create(:user)
      assessment = create(:assessment)

      put :create, params: {
        new_campaign_id: assessor.campaign_id,
        assessor_id: assessor.id,
        resource: {
          subject_id: subject.id,
          assessment_id: assessment.id
        }
      }, format: :json

      user_assessment = assessor.user_assessments.find_by(
        campaign: campaign.id,
        subject: subject,
        assessment: assessment
      )

      expect(user_assessment).to_not eq(nil)
    end
  end

  describe 'DELETE bulk_delete' do
    it 'bullk_delete user_assessments' do
      user_assessment1 = create(:user_assessment, evaluator: assessor.user, campaign: campaign)

      get :bulk_delete, params: {
        new_campaign_id: assessor.campaign_id,
        assessor_id: assessor.id,
        ids: [user_assessment.id, user_assessment1.id]
      }, format: :json

      expect(UserAssessment.find_by(id: user_assessment.id)).to eq(nil)
      expect(UserAssessment.find_by(id: user_assessment1.id)).to eq(nil)
    end
  end

  describe 'PUT reset' do
    it 'calls ::UsersResults::Reset' do
      expect(UsersResults::Reset).to receive(:call!).with(user_assessment)

      get :reset, params: {
        new_campaign_id: assessor.campaign_id,
        assessor_id: assessor.id,
        id: user_assessment.id
      }, format: :json
    end
  end
end
