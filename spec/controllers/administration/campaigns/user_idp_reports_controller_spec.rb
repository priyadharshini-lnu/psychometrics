# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::UserIdpReportsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:user) { create(:user, :with_project_membership) }
  let(:campaign) { create(:campaign, project_id: user.project_id) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:idp_template) { create(:idp_template) }
  let!(:user_idp_plan) { create(:user_idp_plan, user: user, campaign: campaign, idp_template: idp_template) }
  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'GET show' do
    it 'renders json response' do
      get :show, params: { new_campaign_id: campaign.id, id: user_idp_plan.id }, format: :json

      # TODO: update on implementation
      expect(response.status).to eq(200)
    end
  end

  describe 'GET pdf_preview' do
    it 'renders appropriate view' do
      get :pdf_preview, params: { new_campaign_id: campaign.id, id: user_idp_plan.id }

      expect(response).to render_template('layouts/pdf')
      expect(response).to render_template('administration/campaigns/user_idp_reports/idp_report')
    end
  end

  describe 'GET download' do
    it 'sends pdf file for download' do
      file_path = 'tmp/reports/user.pdf'

      expect(UserReports::GenerateIdpReportPdf).to receive(:call!).and_return(file_path: file_path)
      expect(controller).to receive(:send_tmp_file).with(file_path, type: 'application/pdf')

      get :download, params: { new_campaign_id: campaign.id, id: user_idp_plan.id }, format: :pdf
    end
  end
end
