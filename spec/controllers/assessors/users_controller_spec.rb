# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessors::UsersController, type: :controller do
  let(:current_user) { create(:user, :assessor) }
  let(:assessors_campaign) { current_user.assessors.first.campaign }
  let(:subject_user) { create(:user) }
  let!(:assessors_user_assessment) do
    create(:user_assessment, evaluator: current_user, campaign: assessors_campaign, subject: subject_user,
      relationship: Relationship.assessor_relationship, assessment: create(:assessment, category: :assessor_form))
  end
  let(:assessors_user) { assessors_user_assessment.subject }
  let!(:non_assssor_campaign) { create(:campaign) }
  let!(:non_assssor_user) { create(:user_assessment, evaluator: current_user, campaign: non_assssor_campaign).subject }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'index' do
    it 'returns users which assessor have access to' do
      get :index, params: { campaign_id: assessors_campaign.id }

      parsed_response = response.parsed_body
      expect(parsed_response['total']).to eq(1)
      expect(parsed_response['list']).to eq([{
        'id' => assessors_user.id,
        'full_name' => assessors_user.decorate.full_name,
        'email' => assessors_user.email,
        'evaluation_completion_status' => 'not_started',
        'completed_evaluations' => 0,
        'total_evaluations' => 1,
        'moderation_completion_status' => 'completed',
        'total_moderation' => 0,
        'completed_moderation' => 0,
        'permissions' => {
          'add_subject' => false,
          'remove_subject' => false
        },
        'assessor_can_moderate_scores' => false
      }])
    end
  end

  describe 'show' do
    before do
      allow_any_instance_of(ActiveStorage::Current).to receive(:url_options).and_return(
        { host: 'localhost', port: 3000 }
      )
    end

    it 'returns users details' do
      get :show, params: { campaign_id: assessors_campaign.id, id: subject_user.id }

      parsed_response = response.parsed_body
      expect(parsed_response['user']).to eq({
        'id' => subject_user.id,
        'full_name' => subject_user.decorate.full_name,
        'email' => subject_user.email,
        'completed_evaluations' => 0,
        'total_evaluations' => 0,
        'evaluation_completion_status' => 'completed',
        'completed_moderation' => 0,
        'moderation_completion_status' => 'completed',
        'total_moderation' => 0,
        'permissions' => {
          'add_subject' => false,
          'remove_subject' => false
        },
        'assessor_can_moderate_scores' => false
      })
    end

    it 'returns userAssessment details' do
      get :show, params: { campaign_id: assessors_campaign.id, id: subject_user.id }

      parsed_response = response.parsed_body
      expect(parsed_response['user_assessments']).to eq([{
        'id' => assessors_user_assessment.id,
        'assessment_name' => assessors_user_assessment.assessment.name,
        'status' => assessors_user_assessment.users_result.status,
        'assessment_id' => assessors_user_assessment.assessment_id,
        'responses_count' => 1
      }])
    end

    it 'returns UserReport details for reports that are visible to assessor' do
      reports = create_list(:report, 2)
      create(:campaign_report, campaign: assessors_campaign, report: reports[0], assessor_access: true)
      create(:campaign_report, campaign: assessors_campaign, report: reports[1], assessor_access: false)
      create(:module, page: create(:page, report: reports[0]))

      user_report1 = create(:user_report, campaign: assessors_campaign, user: subject_user, report: reports[0])
      create(:user_report_pdf, :with_pdf, user_report: user_report1)
      create(:user_report, campaign: assessors_campaign, user: subject_user, report: reports[1])

      get :show, params: { campaign_id: assessors_campaign.id, id: subject_user.id }

      parsed_response = response.parsed_body
      expect(parsed_response['user_reports'].size).to eq(1)

      report_data = parsed_response['user_reports'].first
      expect(report_data).to include(
        'id' => user_report1.id,
        'name' => reports[0].name,
        'internal' => true,
        'report_url' => user_report1.pdf_download_url,
        'status' => 'not_prepared'
      )

      expect(report_data['unavailability_reason_details']).to include(
        'available' => false,
        'reason_code' => 'assessment_not_completed'
      )
      expect(report_data['unavailability_reason_details']['reason_message']).to be_present
    end
  end
end
