# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessors::ScoreModerationsController, type: :controller do
  let(:current_user) { create(:user, :assessor) }
  let(:assessors_campaign) { current_user.assessors.first.campaign }
  let!(:report) { create(:report) }
  let!(:report2) { create(:report) }
  let(:subject_user) { create(:user) }
  let(:lead_assessment) { create(:assessment, category: :lead_assessor_form) }
  let!(:campaign_assessments) do
    create(:campaign_assessor_assessment, campaign: assessors_campaign, assessment: lead_assessment)
    create(:campaign_assessment, campaign: assessors_campaign, assessment: lead_assessment)
  end
  let!(:campaign_reports) do
    create(:campaign_report, campaign: assessors_campaign, report: report, main_report: true)
    create(:campaign_report, campaign: assessors_campaign, report: report2)
  end
  let!(:user_report) do
    create(:user_report, campaign: assessors_campaign, report: report, user: subject_user, status: :prepared)
  end
  let!(:user_report2) do
    create(:user_report, campaign: assessors_campaign, report: report2, user: subject_user, status: :prepared)
  end
  let!(:assessors_user_assessment) do
    create(:user_assessment, evaluator: current_user, campaign: assessors_campaign, subject: subject_user)
    create(:user_assessment, assessment: lead_assessment, evaluator: current_user,
           campaign: assessors_campaign, subject: subject_user)
  end

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'reports' do
    it 'main report should be nil for incomplete assessment' do
      get :reports, params: { campaign_id: assessors_campaign.id, id: subject_user.id }
      parsed_response = JSON.parse(response.body)
      expect(parsed_response['reports'].size).to eq(1)
      expect(parsed_response['reports'].first['id']).to eq(user_report2.id)
      expect(parsed_response['main_report_id']).to eq(nil)
    end

    it 'returns subject reports and main report' do
      create(:user_assessment, evaluator: current_user, campaign: assessors_campaign, subject: subject_user,
           assessment: report.assessments.first, status: :completed)
      get :reports, params: { campaign_id: assessors_campaign.id, id: subject_user.id }
      parsed_response = JSON.parse(response.body)
      expect(parsed_response['reports'].size).to eq(1)
      expect(parsed_response['reports'].first['id']).to eq(user_report2.id)
      expect(parsed_response['main_report_id']).to eq(user_report.id)
    end
  end
end
