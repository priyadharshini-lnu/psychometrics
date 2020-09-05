# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::UserAssessmentsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:dimension) { create(:dimension) }
  let(:assessment) { create(:assessment, dimension: dimension) }
  let!(:campaign_assessment) { create(:campaign_assessment, assessment: assessment, campaign: campaign) }
  let!(:norm) { create(:norm, name: 'Norm', dimension: dimension) }
  let!(:report) { create(:report, assessments: [assessment]) }
  let(:report_family) { report.report_families.first }
  let(:user) { create(:user) }
  let(:users_result) do
    create(
      :users_result,
      subject: user,
      evaluator: user,
      campaign: campaign,
      assessment: assessment,
      status: :completed,
      expiry_date: 1.year.ago
    )
  end

  let!(:user_assessment) do
    create(
      :user_assessment, subject: user, assessment: assessment, campaign: campaign, users_result: users_result
    )
  end

  let!(:user_report) do
    create(
      :user_report, user: user, campaign: campaign, report: assessment.reports.first, status: :prepared
    )
  end

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

  it '[POST] update_additional_time' do
    post :update_additional_time, params: {
      id: user_assessment.id,
      new_campaign_id: campaign.id,
      additional_time: 10
    }, as: :json

    parsed_response = JSON.parse(response.body)

    users_result.reload

    expect(users_result.additional_time).to eq(600)
    expect(users_result.status).to eq('interrupted')
    expect(users_result.expiry_date).to be_nil
    expect(parsed_response['id']).to eq(user_assessment.id)
    expect(user_report.reload.status).to eq('generating')
  end

  it '[POST] rescore_responses' do
    expect(::UsersResults::Recompute).to receive(:call!)
    expect(::UserReports::GeneratePdfJob).to receive(:perform_now)

    post :rescore_response, params: {
      id: user_assessment.id,
      new_campaign_id: campaign.id
    }

    expect(response).to have_http_status(:success)
  end
end
