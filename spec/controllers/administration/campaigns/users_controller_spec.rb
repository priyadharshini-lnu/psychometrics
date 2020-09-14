# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::UsersController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:user) { create(:user, :with_project_membership) }
  let(:campaign) { create(:campaign, project_id: user.project_id) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:assessment) { create(:assessment) }
  let(:report) { create(:report, assessments: [assessment]) }
  let(:report_family) { report.report_families.first }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'show' do
    it 'check response' do
      user_report = create(:user_report, user: user, campaign: campaign, report: report, report_family: report_family)
      user_assessment = create(:user_assessment,
                               campaign: campaign, assessment: assessment, subject: user, evaluator: user)

      get :show, params: { new_campaign_id: campaign.id, id: user.id }

      parsed_response = JSON.parse(response.body)
      check_user_response(parsed_response.except('user_assessments', 'user_reports'))
      check_report_response(parsed_response['user_reports'].first, user_report)
      check_assessment_response(parsed_response['user_assessments'].first, user_assessment, user_report)
    end
  end

  describe 'PUT toggle_status' do
    it 'toggles user status' do
      put :toggle_status, params: { new_campaign_id: campaign.id, id: user.id }
      expect(response).to have_http_status(:success)
    end
  end

  describe 'DELETE' do
    it 'removes campaign user and dependant data' do
      campaign_user = create(:campaign_user)
      expect do
        delete :destroy, params: { new_campaign_id: campaign_user.campaign_id, id: campaign_user.user_id }
      end.to change(CampaignUser, :count).by(-1)
      expect(response.body).to eq(campaign_user.user_id.to_s)
    end
  end

  describe 'GET reset_password' do
    it 'sends email to user to reset password' do
      get :reset_password, params: { new_campaign_id: campaign.id, id: user.id }
      expect(ActionMailer::Base.deliveries.count(1))
      expect(ActionMailer::Base.deliveries.first.subject).to eq('Reset password instructions')
      expect(response).to have_http_status(:success)
    end
  end

  private

  def check_user_response(user_response)
    expect(user_response).to eq({
      'id' => user.id,
      'full_name' => user.decorate.full_name,
      'email' => user.email,
      'created_at' => I18n.l(user.created_at, format: :short),
      'last_sign_in_at' => nil,
      'campaigns' => [campaign.slice('name', 'id')],
      'active' => campaign_user.active
    })
  end

  def check_report_response(report_response, user_report)
    expect(report_response).to eq({
      'id' => user_report.id,
      'report_id' => report.id,
      'name' => report.name,
      'user_access' => user_report.user_access,
      'report_family_name' => report_family.name,
      'status' => 'not_prepared'
    })
  end

  def check_assessment_response(assessment_response, user_assessment, user_report)
    expect(assessment_response).to eq({
      'id' => user_assessment.id,
      'assessment_id' => assessment.id,
      'name' => assessment.name,
      'category' => assessment.category,
      'norm_name' => nil,
      'norms' => [],
      'norm_id' => nil,
      'norm_type' => nil,
      'additional_time' => nil,
      'is_expired' => false,
      'status' => 'not_started',
      'user_reports_ids' => [user_report.id]
    })
  end
end
