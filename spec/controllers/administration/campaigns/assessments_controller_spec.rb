# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::AssessmentsController, type: :controller do
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

  describe '[POST] update_norm' do
    it 'with apply = false' do
      expect(::CampaignAssessments::RecomputeResultsJob).to_not receive(:perform_later)

      post :update_norm, params: {
        id: assessment.id,
        new_campaign_id: campaign.id,
        apply: false,
        norm_id: norm.id,
        norm_type: 'ETI'
      }, as: :json

      parsed_response = JSON.parse(response.body)

      campaign_assessment.reload

      expect(parsed_response).to eq('norm_type' => 'ETI', 'norm_name' => 'Norm')
      expect(campaign_assessment.norm_id).to eq(norm.id)
      expect(campaign_assessment.norm_type).to eq('ETI')
    end

    it 'with apply = true' do
      expect(::CampaignAssessments::RecomputeResultsJob).to receive(:perform_later).
        with(campaign_assessment, current_user)

      post :update_norm, params: {
        id: assessment.id,
        new_campaign_id: campaign.id,
        apply: true,
        norm_id: norm.id,
        norm_type: 'ETI'
      }, as: :json

      parsed_response = JSON.parse(response.body)

      expect(parsed_response).to eq('norm_type' => 'ETI', 'norm_name' => 'Norm')
    end
  end

  describe 'POST rescore_responses' do
    it 'schedules RecomputeResultsJob' do
      expect(::CampaignAssessments::RecomputeResultsJob).to receive(:perform_later).
        with(campaign_assessment, current_user)

      post :rescore_responses, params: {
        id: assessment.id,
        new_campaign_id: campaign.id
      }

      expect(response).to have_http_status(:success)
    end
  end
end
