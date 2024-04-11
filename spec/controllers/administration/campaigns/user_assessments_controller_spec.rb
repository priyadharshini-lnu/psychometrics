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
      status: :completed
    )
  end

  let!(:user_assessment) do
    users_result.user_assessment.update(expiry_date: 1.year.ago)
    users_result.user_assessment
  end
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }

  let!(:user_report) do
    create(
      :user_report, user: user, campaign: campaign, report: assessment.reports.first, status: :prepared
    )
  end

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  it '[POST] update_norm' do
    user_assessment.update!(status: :not_started)
    post :update_norm, params: {
      id: user_assessment.id,
      new_campaign_id: campaign.id,
      norm_id: norm.id
    }, as: :json

    parsed_response = JSON.parse(response.body)

    users_result.reload

    expect(parsed_response).to eq('norm_name' => 'Norm')
    expect(users_result.norm_id).to eq(norm.id)
  end

  it '[POST] update_additional_time' do
    post :update_additional_time, params: {
      id: user_assessment.id,
      new_campaign_id: campaign.id,
      additional_time: 10
    }, as: :json

    parsed_response = JSON.parse(response.body)
    user_assessment.reload

    expect(user_assessment.additional_time).to eq(600)
    expect(user_assessment.status).to eq('interrupted')
    expect(user_assessment.expiry_date).to be_nil
    expect(parsed_response.dig('user_assessments', 0, 'id')).to eq(user_assessment.id)
    expect(parsed_response['id']).to eq(user.id)
    expect(parsed_response['user_reports'].class).to be(Array)
    expect(user_report.reload.status).to eq('not_prepared')
  end

  it '[POST] rescore_responses' do
    expect(AdminJob).to receive(:call)

    post :rescore_response, params: {
      id: user_assessment.id,
      new_campaign_id: campaign.id
    }

    expect(response).to have_http_status(:success)
  end

  it '[POST] reset' do
    post :reset, params: {
      id: user_assessment.id,
      new_campaign_id: campaign.id
    }

    parsed_response = JSON.parse(response.body)
    expect(parsed_response.dig('user_assessments', 0, 'id')).to eq(user_assessment.id)
    expect(parsed_response['id']).to eq(user.id)
    expect(parsed_response['user_reports'].class).to be(Array)
  end

  describe 'DELETE' do
    it 'removes user_assessment' do
      expect do
        delete :destroy, params: {
          new_campaign_id: campaign.id,
          id: user_assessment.id
        }
      end.to change(UserAssessment, :count).by(-1)
      parsed_response = JSON.parse(response.body)

      expect(parsed_response['user_assessments']).to be_empty
      expect(parsed_response['id']).to eq(user.id)
      expect(parsed_response['user_reports'].class).to be(Array)
    end
  end
end
