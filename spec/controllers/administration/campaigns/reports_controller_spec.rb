# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::ReportsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:report) { create(:report, assessments: [assessment]) }
  let(:report_family) { report.report_families.first }
  let!(:assessor_relationship) { create(:relationship, type: :global, name: 'Assessor') }
  let(:assessor_assessment) { create(:assessment, category: :assessor_form) }
  let!(:assessor_user_assessment) do
    create(:user_assessment, campaign_id: campaign.id, relationship: assessor_relationship,
      assessment: assessor_assessment)
  end

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

  describe 'toggle_user_access' do
    let(:campaign_report) { create :campaign_report, campaign: campaign, report: report, user_access: false }

    it 'toggles campaign_report user_access column value' do
      put :toggle_user_access, params: {
        new_campaign_id: campaign_report.campaign_id,
        id: campaign_report.id
      }
      parsed_response = JSON.parse(response.body)
      expect(parsed_response['user_access']).to be_truthy
    end
  end

  describe 'toggle_assessor_access' do
    it 'toggles campaign_report user_access column value' do
      campaign_report = create(:campaign_report, campaign: campaign, report: report, assessor_access: false)
      patch :toggle_assessor_access, params: {
        new_campaign_id: campaign_report.campaign_id,
        id: campaign_report.id
      }

      expect(campaign_report.reload.assessor_access).to eq(true)
    end
  end

  describe 'toggle_main_report' do
    it 'toggles campaign_report main_report column value' do
      campaign_report = create(:campaign_report, campaign: campaign, report: report, main_report: false)
      patch :toggle_main_report, params: {
        new_campaign_id: campaign_report.campaign_id,
        id: campaign_report.id,
        main_report: true
      }

      expect(campaign_report.reload.main_report).to eq(true)
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

  describe 'DELETE' do
    it 'removes campaign_report' do
      campaign_report = create(:campaign_report, report: report, campaign: campaign)
      expect do
        delete :destroy, params: {
          new_campaign_id: campaign.id,
          id: campaign_report.id
        }
      end.to change(CampaignReport, :count).by(-1)
      expect(response.body).to eq(campaign_report.id.to_s)
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
    expect(report_response.keys).to contain_exactly(
      *%w[id report_id name user_access assessor_access report_family_name permissions user_dashboard main_report]
    )
    expect(report_response).to include({
      'name' => report.name,
      'report_family_name' => report_family.name,
      'user_access' => false,
      'assessor_access' => false
    })

    assessment_response = parsed_response['assessments'].first
    expect(assessment_response.keys).to contain_exactly(
      *%w[
        id
        assessment_id
        name
        category
        norm_name
        norm_id
        enable_universal_links
        universal_link
        norms
        is_external
        assessor_form_name
        permissions
        has_external_norm
        available_locales
        all_locales
        external_config
        campaign_assessment_id
        prework
        workshop_activity
        workshop_activity_duration
        allow_multiple_responses
        require_scheduling
      ]
    )
    expect(assessment_response).to include({
      'name' => assessment.name,
      'category' => assessment.category,
      'norm_name' => nil,
      'has_external_norm' => false
    })

    assessment_response = parsed_response['assessor_assessments'].first
    policy = Administration::CampaignAssessmentPolicy.new(current_user, assessor_assessment)
    expect(assessment_response).to eq({
      'id' => assessor_assessment.id,
      'name' => assessor_assessment.name,
      'linked_assessment_name' => nil,
      'permissions' => {
        'export_external_results' => policy.export_external_results?,
        'export_normed_results' => policy.export_normed_results?,
        'export_raw_factor_scores' => policy.export_raw_factor_scores?,
        'export_raw_results' => policy.export_raw_results?,
        'export_scoring_results' => policy.export_scoring_results?,
        'import_results' => policy.import_results?,
        'rescore_responses' => policy.rescore_responses?
      }
    })
  end
end
