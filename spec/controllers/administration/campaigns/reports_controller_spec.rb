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

      parsed_response = response.parsed_body

      check_campaign_reports_and_assesment_response(parsed_response)
    end

    it 'push to admin job when operation is not skip_existing' do
      expect(AdminJob).to receive(:call).
        with(:add_campaign_reports,
             { campaign_id: campaign.id,
               resource_params: ActionController::Parameters.new(
                 report_family_id: report_family.id.to_s,
                 operation: 'add_with_existing_response',
                 report_ids: [report.id.to_s]
               ).permit! },
             current_user)

      put :create, params: {
        project_id: campaign.project_id,
        new_campaign_id: campaign.id,
        resource: { report_family_id: report_family.id, report_ids: [report.id],
                    operation: 'add_with_existing_response' }
      }
    end
  end

  describe 'toggle_user_access' do
    let(:campaign_report) { create :campaign_report, campaign: campaign, report: report, user_access: false }

    it 'toggles campaign_report user_access column value' do
      put :toggle_user_access, params: {
        new_campaign_id: campaign_report.campaign_id,
        id: campaign_report.id
      }
      parsed_response = response.parsed_body
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

      parsed_response = response.parsed_body
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

      report_family_response = response.parsed_body.first
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

  describe 'get_bulk_assets_zip_presigned_upload_url' do
    let(:campaign_report) { create(:campaign_report, campaign: campaign, report: report) }
    let(:blob) do
      double(
        :blob,
        as_json: { signed_id: 'signed_id' },
        service_url_for_direct_upload: 'url',
        service_headers_for_direct_upload: 'headers'
      )
    end

    before do
      allow(ActiveStorage::Blob).to receive(:create_before_direct_upload!).and_return(blob)
      allow(blob).to receive(:as_json).and_return(blob.as_json)
      allow(blob).to receive(:service_url_for_direct_upload).and_return('url')
      allow(blob).to receive(:service_headers_for_direct_upload).and_return('headers')
    end

    it 'returns presigned url for bulk asset upload' do
      post :get_bulk_assets_zip_presigned_upload_url, params: {
        new_campaign_id: campaign.id,
        id: campaign_report.id,
        blob: {
          content_type: 'application/pdf',
          byte_size: 1024,
          checksum: 'abc123',
          filename: 'test.pdf'
        }
      }

      parsed_response = response.parsed_body

      expect(parsed_response).to eq({
        'signed_id' => 'signed_id',
        'url' => 'url',
        'media_id' => campaign_report.id,
        'direct_upload' => { 'url' => 'url', 'headers' => 'headers' }
      })
    end
  end

  describe 'get_bulk_assets_csv_presigned_upload_url' do
    let(:campaign_report) { create(:campaign_report, campaign: campaign, report: report) }
    let(:blob) do
      double(
        :blob,
        as_json: { signed_id: 'signed_id' },
        service_url_for_direct_upload: 'url',
        service_headers_for_direct_upload: 'headers'
      )
    end

    before do
      allow(ActiveStorage::Blob).to receive(:create_before_direct_upload!).and_return(blob)
      allow(blob).to receive(:as_json).and_return(blob.as_json)
      allow(blob).to receive(:service_url_for_direct_upload).and_return('url')
      allow(blob).to receive(:service_headers_for_direct_upload).and_return('headers')
    end

    it 'returns presigned url for bulk asset upload' do
      post :get_bulk_assets_csv_presigned_upload_url, params: {
        new_campaign_id: campaign.id,
        id: campaign_report.id,
        blob: {
          content_type: 'text/csv',
          byte_size: 1024,
          checksum: 'abc123',
          filename: 'test.csv'
        }
      }

      parsed_response = response.parsed_body

      expect(parsed_response).to eq({
        'signed_id' => 'signed_id',
        'url' => 'url',
        'media_id' => campaign_report.id,
        'direct_upload' => { 'url' => 'url', 'headers' => 'headers' }
      })
    end
  end

  describe 'attach_bulk_asset' do
    before do
      allow_any_instance_of(ActiveStorageAttachable).to receive(:disk_service?).and_return(false)
      allow(AdminJob).to receive(:call)
    end
    let(:campaign_report) { create(:campaign_report, campaign: campaign, report: report) }
    let(:zip_path) { Rails.root.join('spec/fixtures/files/sample.zip') }
    let(:zip_blob) do
      ActiveStorage::Blob.create_and_upload!(
        io: File.open(zip_path, 'rb'),
        filename: 'sample.zip',
        content_type: 'application/zip'
      )
    end
    let(:zip_signed_id) { zip_blob.signed_id }
    let(:csv_path) { Rails.root.join('spec/fixtures/files/test.csv') }
    let(:csv_blob) do
      ActiveStorage::Blob.create_and_upload!(
        io: File.open(csv_path, 'rb'),
        filename: 'test.csv',
        content_type: 'text/csv'
      )
    end
    let(:csv_signed_id) { csv_blob.signed_id }

    it 'attaches uploaded bulk asset to campaign report' do
      post :attach_bulk_asset_csv_and_zip, params: {
        new_campaign_id: campaign.id,
        id: campaign_report.id,
        zip_signed_id: zip_signed_id,
        csv_signed_id: csv_signed_id
      }

      expect(campaign_report.reload.bulk_assets_zip).to be_attached
      expect(campaign_report.bulk_assets_csv).to be_attached
      expect(AdminJob).to have_received(:call).with(:campaign_report_extract_and_upload_bulk_assets, {
        campaign_report_id: campaign_report.id.to_s
      }, current_user)
    end
  end

  private

  def check_campaign_reports_and_assesment_response(parsed_response)
    check_report_response(parsed_response['reports'].first)
    check_assessment_response(parsed_response['assessments'].first)
    check_assessor_assessment_response(parsed_response['assessor_assessments'].first)
  end

  def check_report_response(report_response)
    expect(report_response.keys).to contain_exactly(
      *%w[id report_id name user_access assessor_access report_family_name permissions user_dashboard main_report
          auto_assign available_languages report_locales effective_default_language internal custom_upload
          assessment_ids external_settings report_provider status user_report_id
          owner tenant_id]
    )
    expect(report_response).not_to have_key('campaign_assessment_id')
    expect(report_response).to include({
      'name' => report.name,
      'report_family_name' => report_family.name,
      'user_access' => false,
      'assessor_access' => false
    })
  end

  def check_assessment_response(assessment_response)
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
        auto_assign
        mettl_schedule_name
        mettl_schedule_record_id
        dimension_id
        simulation_content_variations
        pearson_variations
        allow_caching
        caching_enabled
        mhs_norm_regions
        mhs_norm_options
        proctoring_enabled
        is_timed
        fixed_time_duration
        occupation_condition_set_id
        occupation_condition_set_name
        dimension_has_occupations
        occupation_condition_sets
        owner
        tenant_id
      ]
    )
    expect(assessment_response['campaign_assessment_id']).to be_a(Integer)
    expect(assessment_response).to include({
      'name' => assessment.name,
      'category' => assessment.category,
      'norm_name' => nil,
      'has_external_norm' => false
    })
  end

  def check_assessor_assessment_response(assessment_response)
    policy = Administration::CampaignAssessmentPolicy.new(current_user, assessor_assessment)
    expect(assessment_response.keys).to contain_exactly(
      *%w[id name linked_assessment_name permissions owner tenant dimension_id tenant_id]
    )
    expect(assessment_response).not_to have_key('campaign_assessment_id')
    expect(assessment_response).to include({
      'id' => assessor_assessment.id,
      'name' => assessor_assessment.name,
      'linked_assessment_name' => nil,
      'owner' => nil,
      'tenant' => nil,
      'dimension_id' => assessor_assessment.dimension_id,
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
