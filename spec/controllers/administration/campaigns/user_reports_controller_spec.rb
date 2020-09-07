# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::UserReportsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:user) { create(:user, :with_project_membership) }
  let(:campaign) { create(:campaign, project_id: user.project_id) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:assessment) { create(:assessment) }
  let(:report) { create(:report, assessments: [assessment]) }
  let!(:user_report) { create(:user_report, report: report, user: campaign_user.user) }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'create' do
    let(:report_family) { report.report_families.first }
    let!(:license) do
      create(:license, report_family: report_family, client: campaign.client, start_date: 2.days.ago,
        end_date: 2.days.since)
    end
    it 'returns error if wrong params are passed' do
      put :create, params: {
        new_campaign_id: campaign.id,
        user_id: user.id,
        resource: { report_family_id: report_family.id, report_ids: [report.id], operation: 'wrong_operation' }
      }

      expect(response).to have_http_status(422)
    end

    it 'create and returns user_report and user_assessment' do
      put :create, params: {
        new_campaign_id: campaign.id,
        user_id: user.id,
        resource: {
          report_family_id: report_family.id,
          report_ids: [report.id],
          operation: 'add_with_existing_response'
        }
      }

      parsed_response = JSON.parse(response.body)
      check_report_response(parsed_response['user_reports'].first)
      check_assessment_response(parsed_response['user_assessments'].first)
    end
  end

  describe 'DELETE' do
    it 'removes users_report' do
      expect do
        delete :destroy, params: { new_campaign_id: user_report.campaign_id, id: user_report.id }
      end.to change(UserReport, :count).by(-1)
      expect(response.body).to eq(user_report.id.to_s)
    end
  end

  describe 'GET show' do
    it 'renders on html request' do
      get :show, params: { new_campaign_id: campaign.id, id: user_report.id }, format: :html

      expect(response).to render_template('administration/projects/new_campaigns/index')
    end

    it 'renders json response' do
      get :show, params: { new_campaign_id: campaign.id, id: user_report.id }, format: :json

      parsed_reponse = JSON.parse(response.body)

      expect(parsed_reponse.keys).to include('report', 'results', 'status', 'user')
    end
  end

  describe 'GET pdf_preview' do
    it 'renders appropriate view' do
      get :pdf_preview, params: { new_campaign_id: campaign.id, id: user_report.id }

      expect(response).to render_template('layouts/pdf')
      expect(response).to render_template('shared/preview_report')
    end
  end

  describe 'GET download' do
    it 'sends pdf file for download' do
      file_path = 'tmp/reports/user.pdf'

      expect(UserReports::GeneratePdf).to receive(:call!).and_return(file_path)
      expect(controller).to receive(:send_file).with(file_path, type: 'application/pdf')

      get :download, params: { new_campaign_id: campaign.id, id: user_report.id }, format: :pdf
    end
  end

  private

  def check_report_response(report_response)
    expect(report_response.keys).to eq(%w[id report_id name user_access report_family_name status])
    expect(report_response).to include({
      'report_id' => report.id,
      'name' => report.name,
      'user_access' => false,
      'report_family_name' => report_family.name,
      'status' => 'not_prepared'
    })
  end

  def check_assessment_response(assessment_response)
    expect(assessment_response.keys).to eq(
      %w[id assessment_id name category norm_name status norms norm_type norm_id additional_time is_expired]
    )
    expect(assessment_response).to include({
      'assessment_id' => assessment.id,
      'name' => assessment.name,
      'category' => assessment.category,
      'norm_name' => nil,
      'norm_type' => nil,
      'norms' => [],
      'status' => 'not_started'
    })
  end
end
