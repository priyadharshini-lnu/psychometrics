# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::TextModuleOverridesController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:user) { create(:user, :with_project_membership) }
  let(:campaign) { create(:campaign, project_id: user.project_id) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:assessment) { create(:assessment) }
  let(:report) { create(:report, assessments: [assessment]) }
  let(:user_report) do
    create(:user_report, report: report, user: campaign_user.user, campaign: campaign, approved: true)
  end
  let(:report_family) { report.report_families.first }
  let(:module_override) { create(:text_module_override) }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'create' do
    it 'text module override should reset approval status to false' do
      post :create, params: {
        new_campaign_id: campaign.id,
        user_report_id: user_report.id,
        module_id: 1,
        content: 'qqqqqqq'
      }
      parsed_response = response.parsed_body
      expect(response).to have_http_status(200)
      expect(parsed_response['approved']).to eq(false)
      expect(parsed_response['content']).to eq('qqqqqqq')
      expect(user_report.reload.approved).to eq(false)
    end
  end

  describe 'update' do
    it 'text module override should reset approval status to false' do
      put :update, params: {
        id: module_override.id,
        new_campaign_id: campaign.id,
        user_report_id: user_report.id,
        module_id: 1,
        content: 'xxxx'
      }
      expect(response).to have_http_status(200)
      expect(module_override.reload.content).to eq('xxxx')
      expect(user_report.reload.approved).to eq(false)
    end
  end

  describe 'aprove without existing' do
    it 'text module override and should not change report approval status' do
      put :approve, params: {
        new_campaign_id: campaign.id,
        user_report_id: user_report.id,
        module_id: 1
      }
      parsed_response = response.parsed_body
      expect(response).to have_http_status(200)
      expect(parsed_response['content']).to eq(nil)
      expect(parsed_response['approved']).to eq(true)
      expect(user_report.approved).to eq(true)
    end
  end

  describe 'approve with existing and should not change report approval status' do
    it 'text module override' do
      put :approve, params: {
        id: module_override.id,
        new_campaign_id: campaign.id,
        user_report_id: user_report.id,
        module_id: 1
      }
      parsed_response = response.parsed_body
      expect(parsed_response['content']).to eq(module_override.content)
      expect(parsed_response['approved']).to eq(true)
      expect(user_report.approved).to eq(true)
    end
  end

  describe 'delete' do
    it 'text module override should reset approval status to false' do
      delete :destroy, params: {
        id: module_override.id,
        new_campaign_id: campaign.id,
        user_report_id: user_report.id
      }
      expect(response).to have_http_status(200)
      expect(user_report.reload.approved).to eq(false)
    end
  end
end
