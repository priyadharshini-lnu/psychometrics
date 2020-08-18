# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::UserAssessmentsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:dimension) { create(:dimension) }
  let(:assessment) { create(:assessment, dimension: dimension) }
  let!(:campaign_assessment) { create(:campaign_assessment, assessment: assessment, campaign: campaign) }
  let!(:norm) { create(:norm, name: 'Norm', dimension: dimension) }
  let(:report) { create(:report, assessments: [assessment]) }
  let(:report_family) { report.report_families.first }
  let(:user) { create(:user) }
  let(:users_result) { create(:users_result, subject: user, campaign: campaign, assessment: assessment) }
  let!(:user_assessment) { create(:user_assessment, subject: user, campaign: campaign, users_result: users_result) }
  let!(:user_report) { create(:user_report, user: user, campaign: campaign, report: report, status: :prepared) }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  it '[POST] update_norm' do
    expect(::UsersResults::Recompute).to receive(:call!)
    expect(::UserReports::GeneratePdfJob).to receive(:perform_now)

    post :update_norm, params: {
      id: user_assessment.id,
      new_campaign_id: campaign.id,
      norm_id: norm.id,
      norm_type: 'ETI'
    }, as: :json

    parsed_response = JSON.parse(response.body)

    users_result.reload

    expect(parsed_response).to eq('norm_type' => 'ETI', 'norm_name' => 'Norm')
    expect(users_result.norm_id).to eq(norm.id)
    expect(users_result.norm_type).to eq('ETI')
  end
end
