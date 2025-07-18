# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::UserReportsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:user) { create(:user, :with_project_membership) }
  let(:campaign) { create(:campaign, project_id: user.project_id) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:assessment) { create(:assessment) }
  let(:report) { create(:report, assessments: [assessment]) }
  let(:user_report) { create(:user_report, report: report, user: campaign_user.user, campaign: campaign) }
  let(:report_family) { report.report_families.first }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'create' do
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

      parsed_response = response.parsed_body
      check_report_response(parsed_response['user_reports'].first)
      check_assessment_response(parsed_response['user_assessments'].first)
      expect(parsed_response['id']).to eq(user.id)
    end
  end

  describe 'DELETE' do
    it 'removes users_report' do
      expect(user_report).to_not eq(nil)

      expect do
        delete :destroy, params: { new_campaign_id: user_report.campaign_id, id: user_report.id }
      end.to change(UserReport, :count).by(-1)

      parsed_response = response.parsed_body
      expect(parsed_response['user_reports']).to be_empty
      expect(parsed_response['id']).to eq(user.id)
      expect(parsed_response['user_assessments'].class).to be(Array)
      expect(parsed_response['id']).to eq(user.id)
    end
  end

  describe 'GET show' do
    it 'renders json response' do
      get :show, params: { new_campaign_id: campaign.id, id: user_report.id }, format: :json

      parsed_reponse = response.parsed_body

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

      expect(UserReports::GeneratePdf).to receive(:call!).and_return(file_path: file_path)
      expect(controller).to receive(:send_tmp_file).with(file_path, type: 'application/pdf')

      get :download, params: { new_campaign_id: campaign.id, id: user_report.id }, format: :pdf
    end
  end

  describe 'PATCH toggle_user_access' do
    it 'toggles user_report status' do
      patch :toggle_user_access, params: { new_campaign_id: campaign.id, id: user_report.id }
      expect(response).to have_http_status(:success)
    end
  end

  describe 'PATCH start_qc' do
    it 'change approval status to start_qc' do
      user_report.ready!
      patch :start_qc, params: { new_campaign_id: campaign.id, id: user_report.id }
      parsed_response = response.parsed_body
      expect(parsed_response['status']).to eq('qc_in_progress')
      expect(response).to have_http_status(:success)
    end
  end

  describe 'workflow' do
    describe 'PATCH send_for_approval' do
      it 'change approval status to qc_completed' do
        user_report.update(approval_status: 'qc_in_progress')
        patch :send_for_approval, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('qc_completed')
        expect(response).to have_http_status(:success)
      end
    end

    describe 'PATCH abort_qc' do
      it 'change approval status to pending_qc' do
        user_report.update(approval_status: 'qc_in_progress')
        patch :abort_qc, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('pending_qc')
        expect(response).to have_http_status(:success)
      end
    end

    describe 'PATCH approve' do
      it 'change approval status to appove' do
        user_report.update(approval_status: 'qc_completed')
        patch :approve, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('approved')
        expect(response).to have_http_status(:success)
      end
    end

    describe 'PATCH remove_approval' do
      it 'change approval status to change_requested' do
        user_report.update(approval_status: 'approved')
        patch :remove_approval, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('change_requested')
        expect(response).to have_http_status(:success)
      end
    end

    describe 'PATCH request_change' do
      it 'change approval status to change_requested' do
        user_report.update(approval_status: 'qc_completed')
        patch :request_changes, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('change_requested')
        expect(response).to have_http_status(:success)
      end
    end
  end

  describe 'workflow with qc and approver' do
    let!(:qc_user) { create(:campaign_admin, campaign: campaign) }
    let!(:approver_user) { create(:campaign_admin, campaign: campaign) }
    let!(:report_approval_setting) do
      create(:report_approval_setting,
             report_id: user_report.report_id,
             campaign: campaign,
             qc_user_ids: [qc_user.id],
             approver_user_ids: [approver_user.id])
    end
    describe 'QC flow' do
      before do
        login_user(qc_user)
      end
      it 'change approval status to qc_in_progress' do
        user_report.ready!
        patch :start_qc, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('qc_in_progress')
        expect(response).to have_http_status(:success)
      end

      it 'change approval status to qc_complete' do
        user_report.update(approval_status: 'qc_in_progress')
        patch :send_for_approval, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('qc_completed')
        expect(response).to have_http_status(:success)
      end

      it 'change approval status from change_requested to qc_in_progress' do
        user_report.update(approval_status: 'change_requested')
        patch :start_qc, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('qc_in_progress')
        expect(response).to have_http_status(:success)
      end

      it 'should not allow to change approval status to approved' do
        user_report.update(approval_status: 'qc_completed')
        patch :approve, params: { new_campaign_id: campaign.id, id: user_report.id }

        expect(user_report.reload.approval_status).to eq('qc_completed')
        expect(response.body).to eq('You do not have access to this page')
        expect(response).to have_http_status(:forbidden)
      end
    end
    describe 'Approver flow' do
      before do
        login_user(approver_user)
      end
      it 'change approval status to qc_in_progress' do
        user_report.ready!
        patch :start_qc, params: { new_campaign_id: campaign.id, id: user_report.id }
        expect(response.body).to eq('You do not have access to this page')
        expect(response).to have_http_status(:forbidden)
      end

      it 'change approval status to approved' do
        user_report.update(approval_status: 'qc_completed')
        patch :approve, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('approved')
        expect(response).to have_http_status(:success)
      end

      it 'change approval status to approved' do
        user_report.update(approval_status: 'qc_completed')
        patch :request_changes, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('change_requested')
        expect(response).to have_http_status(:success)
      end

      it 'remove_approval status status to qc_in_progress' do
        user_report.update(approval_status: 'approved')
        patch :remove_approval, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('change_requested')
        expect(response).to have_http_status(:success)
      end
    end
  end

  describe 'workflow with qc and approver with one level QC flow' do
    let!(:qc_user) { create(:campaign_admin, campaign: campaign) }
    let!(:report_approval_setting) do
      create(:report_approval_setting,
             report_id: user_report.report_id,
             campaign: campaign,
             qc_user_ids: [qc_user.id],
             approver_user_ids: [],
             approvers_not_required: true)
    end
    describe 'QC flow' do
      before do
        login_user(qc_user)
      end
      it 'change approval status to qc_in_progress' do
        user_report.ready!
        patch :start_qc, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('qc_in_progress')
        expect(response).to have_http_status(:success)
      end

      it 'change approval status to qc_complete' do
        user_report.update(approval_status: 'qc_in_progress')
        patch :send_for_approval, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('qc_completed')
        expect(response).to have_http_status(:success)
      end

      it 'change approval status from change_requested to qc_in_progress' do
        user_report.update(approval_status: 'change_requested')
        patch :start_qc, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('qc_in_progress')
        expect(response).to have_http_status(:success)
      end

      it 'change approval status to approved' do
        user_report.update(approval_status: 'qc_completed')
        patch :approve, params: { new_campaign_id: campaign.id, id: user_report.id }

        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('approved')
        expect(response).to have_http_status(:success)
      end

      it 'change approval status to qc_in_progres' do
        user_report.update(approval_status: 'qc_completed')
        patch :request_changes, params: { new_campaign_id: campaign.id, id: user_report.id }

        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('qc_in_progress')
        expect(response).to have_http_status(:success)
      end
    end
  end

  describe 'workflow with approver can edit' do
    let!(:qc_user) { create(:campaign_admin, campaign: campaign) }
    let!(:approver_user) { create(:campaign_admin, campaign: campaign) }
    let!(:report_approval_setting) do
      create(:report_approval_setting,
             report_id: user_report.report_id,
             campaign: campaign,
             qc_user_ids: [qc_user.id],
             approver_user_ids: [approver_user.id],
             approvers_can_edit: true)
    end
    describe 'QC flow' do
      before do
        login_user(qc_user)
      end
      it 'change approval status to qc_in_progress' do
        user_report.ready!
        patch :start_qc, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('qc_in_progress')
        expect(response).to have_http_status(:success)
      end

      it 'change approval status to qc_complete' do
        user_report.update(approval_status: 'qc_in_progress')
        patch :send_for_approval, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('qc_completed')
        expect(response).to have_http_status(:success)
      end

      it 'change approval status from change_requested to qc_in_progress' do
        user_report.update(approval_status: 'change_requested')
        patch :start_qc, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('qc_in_progress')
        expect(response).to have_http_status(:success)
      end

      it 'change approval status to approved' do
        user_report.update(approval_status: 'qc_completed')
        patch :approve, params: { new_campaign_id: campaign.id, id: user_report.id }

        expect(response.body).to eq('You do not have access to this page')
        expect(response).to have_http_status(:forbidden)
      end

      it 'change approval status to qc_in_progres' do
        user_report.update(approval_status: 'qc_completed')
        patch :request_changes, params: { new_campaign_id: campaign.id, id: user_report.id }

        expect(response.body).to eq('You do not have access to this page')
        expect(response).to have_http_status(:forbidden)
      end
    end

    describe 'approver flow' do
      before do
        login_user(approver_user)
      end
      it 'not allowed to start qc for approver' do
        user_report.ready!
        patch :start_qc, params: { new_campaign_id: campaign.id, id: user_report.id }
        expect(response.body).to eq('You do not have access to this page')
        expect(response).to have_http_status(:forbidden)
      end

      it 'change approval status to qc_complete' do
        user_report.update(approval_status: 'qc_in_progress')
        patch :send_for_approval, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('qc_completed')
        expect(response).to have_http_status(:success)
      end

      it 'approve changes approval status to approved' do
        user_report.update(approval_status: 'qc_completed')
        expect(UserReports::NotifyApprovals).to receive(:call!)
        patch :approve, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('approved')
        expect(response).to have_http_status(:success)
      end

      it 'request_changes chagne status to qc_in_progress' do
        user_report.update(approval_status: 'qc_completed')
        expect(UserReports::NotifyQc).to_not receive(:call!)
        patch :request_changes, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('qc_in_progress')
        expect(response).to have_http_status(:success)
      end

      it 'send_for_approval change approval status to qc_completed' do
        user_report.update(approval_status: 'qc_in_progress')
        expect(UserReports::NotifyApprovers).to receive(:call!)
        patch :send_for_approval, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('qc_completed')
        expect(response).to have_http_status(:success)
      end
    end
  end

  describe 'send notification' do
    let!(:qc_user) { create(:campaign_admin, campaign: campaign) }
    let!(:approver_user) { create(:campaign_admin, campaign: campaign) }
    let!(:report_approval_setting) do
      create(:report_approval_setting,
             report_id: user_report.report_id,
             campaign: campaign,
             qc_user_ids: [qc_user.id],
             approver_user_ids: [approver_user.id],
             do_not_send_notifications: false)
    end
    describe 'QC flow' do
      it 'change approval status to qc_in_progress' do
        expect(UserReports::NotifyQc).to receive(:call!)
        user_report.ready!
        patch :start_qc, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('qc_in_progress')
        expect(response).to have_http_status(:success)
      end

      it 'change approval status to qc_complete' do
        user_report.update(approval_status: 'qc_in_progress')
        expect(UserReports::NotifyApprovers).to receive(:call!)
        patch :send_for_approval, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('qc_completed')
        expect(response).to have_http_status(:success)
      end

      it 'change approval status to change_requested' do
        user_report.update(approval_status: 'qc_completed')
        expect(UserReports::NotifyQc).to receive(:call!)
        patch :request_changes, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('change_requested')
        expect(response).to have_http_status(:success)
      end
      it 'change approval status to change_requested' do
        user_report.update(approval_status: 'approved')
        expect(UserReports::NotifyQc).to receive(:call!)
        patch :remove_approval, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('change_requested')
        expect(response).to have_http_status(:success)
      end

      it 'change approval status to approved' do
        user_report.update(approval_status: 'qc_completed')
        expect(UserReports::NotifyApprovals).to receive(:call!)
        patch :approve, params: { new_campaign_id: campaign.id, id: user_report.id }

        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('approved')
        expect(response).to have_http_status(:success)
      end
    end
  end

  describe 'do not send any notification' do
    let!(:qc_user) { create(:campaign_admin, campaign: campaign) }
    let!(:approver_user) { create(:campaign_admin, campaign: campaign) }
    let!(:report_approval_setting) do
      create(:report_approval_setting,
             report_id: user_report.report_id,
             campaign: campaign,
             qc_user_ids: [qc_user.id],
             approver_user_ids: [approver_user.id],
             do_not_send_notifications: true)
    end
    describe 'QC flow' do
      it 'change approval status to qc_in_progress' do
        user_report.ready!
        expect(UserReports::NotifyQc).to_not receive(:call!)
        expect(UserReports::NotifyApprovals).to_not receive(:call!)
        expect(UserReports::NotifyApprovers).to_not receive(:call!)
        patch :start_qc, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('qc_in_progress')
        expect(response).to have_http_status(:success)
      end

      it 'change approval status to qc_complete' do
        user_report.update(approval_status: 'qc_in_progress')
        expect(UserReports::NotifyQc).to_not receive(:call!)
        expect(UserReports::NotifyApprovals).to_not receive(:call!)
        expect(UserReports::NotifyApprovers).to_not receive(:call!)
        patch :send_for_approval, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('qc_completed')
        expect(response).to have_http_status(:success)
      end

      it 'change approval status from change_requested to qc_in_progress' do
        user_report.update(approval_status: 'change_requested')
        expect(UserReports::NotifyQc).to_not receive(:call!)
        expect(UserReports::NotifyApprovals).to_not receive(:call!)
        expect(UserReports::NotifyApprovers).to_not receive(:call!)
        patch :start_qc, params: { new_campaign_id: campaign.id, id: user_report.id }
        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('qc_in_progress')
        expect(response).to have_http_status(:success)
      end

      it 'change approval status to approved' do
        user_report.update(approval_status: 'qc_completed')
        expect(UserReports::NotifyQc).to_not receive(:call!)
        expect(UserReports::NotifyApprovals).to_not receive(:call!)
        expect(UserReports::NotifyApprovers).to_not receive(:call!)
        patch :approve, params: { new_campaign_id: campaign.id, id: user_report.id }

        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('approved')
        expect(response).to have_http_status(:success)
      end

      it 'change approval status to qc_in_progres' do
        user_report.update(approval_status: 'qc_completed')
        expect(UserReports::NotifyQc).to_not receive(:call!)
        expect(UserReports::NotifyApprovals).to_not receive(:call!)
        expect(UserReports::NotifyApprovers).to_not receive(:call!)
        patch :request_changes, params: { new_campaign_id: campaign.id, id: user_report.id }

        parsed_response = response.parsed_body
        expect(parsed_response['status']).to eq('change_requested')
        expect(response).to have_http_status(:success)
      end
    end
  end

  describe 'GET dashboard' do
    it 'returns 404 if user with the email is not present' do
      campaign_report = create(:campaign_report,  user_dashboard: true)
      campaign = campaign_report.campaign

      expect do
        get :dashboard, params: { new_campaign_id: campaign.id, email: 'randomemail@cc.com' }
      end.to raise_error(ActiveRecord::RecordNotFound)
    end

    it 'returns 404 if there is no user dashboard in a campaign' do
      campaign_user = create(:campaign_user)
      campaign = campaign_user.campaign

      expect do
        get :dashboard, params: { new_campaign_id: campaign.id, email: campaign_user.user.email }
      end.to raise_error(ActiveRecord::RecordNotFound)
    end

    it 'returns 404 if there user do not have a dashboard report' do
      campaign_report = create(:campaign_report, user_dashboard: true)
      campaign = campaign_report.campaign
      campaign_user = create(:campaign_user, campaign: campaign)

      expect do
        get :dashboard, params: { new_campaign_id: campaign.id, email: campaign_user.user.email }
      end.to raise_error(ActiveRecord::RecordNotFound)
    end

    it 'renders html template for html request' do
      campaign_report = create(:campaign_report, user_dashboard: true)
      campaign = campaign_report.campaign
      campaign_user = create(:campaign_user, campaign: campaign)
      user = campaign_user.user
      create(:user_report, campaign_id: campaign.id, report_id: campaign_report.report_id, user_id: user.id)

      mock_vite_assets
      get :dashboard, params: { new_campaign_id: campaign.id, email: user.email }, format: :html

      expect(response).to render_template('dashboard')
    end

    it 'renders json for json request' do
      campaign_report = create(:campaign_report, user_dashboard: true)
      campaign = campaign_report.campaign
      campaign_user = create(:campaign_user, campaign: campaign)
      user = campaign_user.user
      create(:user_report, campaign_id: campaign.id, report_id: campaign_report.report_id, user_id: user.id)

      get :dashboard, params: { new_campaign_id: campaign.id, email: user.email }, format: :json

      parsed_response = response.parsed_body
      expect(parsed_response.keys).to include('report', 'results', 'status', 'user')
    end
  end

  private

  def check_report_response(report_response)
    expect(report_response.keys).to contain_exactly(
      *%w[id permissions report_id name user_access report_family_name
          status internal report_url custom_upload report_provider
          comments_count edits_count hogan_participant_id available_languages effective_default_language]
    )
    expect(report_response).to include({
      'report_id' => report.id,
      'name' => report.name,
      'user_access' => false,
      'report_family_name' => report_family.name,
      'report_provider' => 'internal',
      'status' => 'not_prepared',
      'internal' => true,
      'custom_upload' => false,
      'report_url' => nil,
      'hogan_participant_id' => nil
    })
  end

  def check_assessment_response(assessment_response)
    expect(assessment_response.keys).to contain_exactly(
      *%w[
        id permissions assessment_id name category norm_name status norms norm_id
        additional_time is_expired is_external has_external_norm schedule_time require_scheduling
        mettl_schedule_name mettl_schedule_record_id dimension_id
        simulation_content_variations hogan_participant_id users_result_id prework
        pearson_user_assessment_details saville_user_assessment_details simulation_user_assessment_details
        skillvue_user_assessment_details
      ]
    )
    expect(assessment_response).to include({
      'assessment_id' => assessment.id,
      'name' => assessment.name,
      'category' => assessment.category,
      'norm_name' => nil,
      'norms' => [],
      'status' => 'not_started',
      'has_external_norm' => false,
      'schedule_time' => nil
    })
  end
end
