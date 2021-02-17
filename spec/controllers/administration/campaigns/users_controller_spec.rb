# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::UsersController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:user) { create(:user, :with_project_membership, email: 'tester@gmail.com') }
  let(:campaign) { create(:campaign, project_id: user.project_id) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:assessment) { create(:assessment, name: 'Test Assessment') }
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
      check_assessment_response(parsed_response['user_assessments'].first, user_assessment)
    end
  end

  describe 'export_completion_status' do
    it 'check response' do
      users_result = create(:users_result, evaluator: user, assessment: assessment)
      create(:user_assessment,
             campaign: campaign,
             assessment: assessment,
             subject: user,
             evaluator: user,
             users_result: users_result)

      get :export_completion_status, format: 'csv', params: { new_campaign_id: campaign.id }

      parsed_response = CSV.parse(response.body)

      expect(parsed_response.length).to eq(2)
      expect(parsed_response.last[2]).to eq('tester@gmail.com')
      expect(parsed_response.last[4]).to eq('Test Assessment')
    end
  end

  describe 'import' do
    it 'run action successfully' do
      file = Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/users_export.csv'), 'text/csv')
      post :import, params: {
        new_campaign_id: campaign.id,
        operation: 'add_with_existing_response',
        import_data: file
      }
      expect(AdminJobRecord.exists?(operation: 'import_users')).to be_truthy
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
      expect(ActionMailer::Base.deliveries.first.subject).to eq('Instructions for resetting your password')
      expect(response).to have_http_status(:success)
    end
  end

  it 'POST search' do
    u = create(:user, email: 'atanych@gmail.com')
    create(:campaign_user, campaign: campaign, user: u)
    post :search, params: { new_campaign_id: campaign.id, q: 'atanych' }

    parsed_response = JSON.parse(response.body)
    expect(parsed_response.length).to eq(1)
    expect(parsed_response.first['email']).to eq('atanych@gmail.com')
  end

  private

  def check_user_response(user_response)
    user_response['campaigns'] = user_response['campaigns'].map { |c| c.slice('name', 'id') }
    expect(user_response).to eq({
      'id' => user.id,
      'full_name' => user.decorate.full_name,
      'email' => user.email,
      'status' => 'not_started',
      'completion_status' => 'not_started',
      'created_at' => I18n.l(user.created_at, format: :short),
      'last_sign_in_at' => nil,
      'campaigns' => [campaign.slice('name', 'id')],
      'active' => campaign_user.active,
      'additional_time' => campaign_user.additional_time,
      'completed_at' => nil,
      'started_at' => nil
    })
  end

  def check_report_response(report_response, user_report)
    expect(report_response).to eq({
      'id' => user_report.id,
      'report_id' => report.id,
      'name' => report.name,
      'user_access' => user_report.user_access,
      'report_family_name' => report_family.name,
      'status' => 'not_prepared',
      'internal' => true,
      'report_url' => nil
    })
  end

  def check_assessment_response(assessment_response, user_assessment)
    expect(assessment_response).to eq({
      'id' => user_assessment.id,
      'assessment_id' => assessment.id,
      'name' => assessment.name,
      'category' => assessment.category,
      'norm_name' => nil,
      'norms' => [],
      'norm_id' => nil,
      'additional_time' => nil,
      'is_expired' => false,
      'is_external' => false,
      'status' => 'not_started'
    })
  end
end
