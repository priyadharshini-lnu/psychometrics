# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::ReportsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:report) { create(:report, assessments: [assessment]) }
  let(:report_family) { report.report_families.first }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'create' do
    it 'returns error if wrong params are passed' do
      put :create, params: {
        project_id: campaign.project_id,
        new_campaign_id: campaign.id,
        resource: { report_family_id: report_family.id, report_ids: [report.id], operation: 'wrong_operation' }
      }

      expect(response).to have_http_status(422)
    end

    it 'returns campaigns assessments and reports when valid params are passed' do
      put :create, params: {
        project_id: campaign.project_id,
        new_campaign_id: campaign.id,
        resource: { report_family_id: report_family.id, report_ids: [report.id], operation: 'skip_existing' }
      }

      parsed_response = JSON.parse(response.body)

      check_campaign_reports_and_assesment_response(parsed_response)
    end
  end

  describe 'assessments_and_reports' do
    it 'returns reports and assessments' do
      create(:campaign_report, campaign: campaign, report: report, report_family: report_family)
      create(:campaign_assessment, campaign: campaign, assessment: assessment)

      get :assessments_and_reports, params: { project_id: campaign.project_id, new_campaign_id: campaign.id }

      parsed_response = JSON.parse(response.body)
      check_campaign_reports_and_assesment_response(parsed_response)
    end
  end

  describe 'report_families' do
    it 'returns report families' do
      report_family = campaign.client.report_families.first
      report = report_family.reports.first

      get :report_families, params: { project_id: campaign.project_id, new_campaign_id: campaign.id }

      report_family_response = JSON.parse(response.body).first
      expect(report_family_response.keys).to eq(%w[id name reports])
      expect(report_family_response).to include({
        'id' => report_family.id,
        'name' => report_family.name,
        'reports' => include(
          'id' => report.id,
          'name' => report.name
        )
      })
    end
  end

  private

  def check_campaign_reports_and_assesment_response(parsed_response)
    report_response = parsed_response['reports'].first
    expect(report_response.keys).to eq(%w[id report_id name user_access report_family_name])
    expect(report_response).to include({
      'name' => report.name,
      'report_family_name' => report_family.name,
      'user_access' => false
    })

    assessment_response = parsed_response['assessments'].first
    expect(assessment_response.keys).to eq(
      %w[id assessment_id name category norm_name norm_type enable_universal_links universal_link]
    )
    expect(assessment_response).to include({
      'name' => assessment.name,
      'category' => assessment.category,
      'norm_name' => nil,
      'norm_type' => nil
    })
  end
end
