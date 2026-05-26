# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::UsersController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:hogan_credential) { create(:hogan_credential) }
  let(:user) do
    create(:user, :with_project_membership, email: 'tester@gmail.com', hogan_credential: hogan_credential)
  end
  let(:campaign) { create(:campaign, project_id: user.project_id) }
  let!(:current_job_role) { create(:job_role, name: 'Developer', project: campaign.project) }
  let!(:target_job_role) { create(:job_role, name: 'Senior dev', project: campaign.project) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:proctoring_session) do
    create(:proctoring_session, campaign_user: campaign_user, started_at: 1.day.ago, completed_at: Time.zone.now,
      results: {
        score: 1,
        comment: 'comment1',
        conclusion: 'conclusion1',
        reportUrl: 'https://examus-report.com/report/10',
        archive: 'https://examus-report.com/archive/10'
      })
  end
  let(:assessment) { create(:assessment, name: 'Test Assessment') }
  let(:report) { create(:report, assessments: [assessment]) }
  let(:report_family) { report.report_families.first }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'show' do
    it 'check response' do
      user_report = create(:user_report, user: user, campaign: campaign, report: report, report_family: report_family)
      user_assessment = create(:user_assessment,
                               campaign: campaign, assessment: assessment, subject: user, evaluator: user)

      get :show, params: { new_campaign_id: campaign.id, id: user.id }

      parsed_response = response.parsed_body
      check_user_response(parsed_response.except('user_assessments', 'user_reports'))
      check_report_response(parsed_response['user_reports'].first, user_report)
      check_assessment_response(parsed_response['user_assessments'].first, user_assessment)
    end
  end

  describe 'import' do
    it 'run action successfully' do
      file = Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/users_export.csv'), 'text/csv')
      post :import, params: {
        new_campaign_id: campaign.id,
        operation: 'add_with_existing_response',
        import_data: file
      }
      expect(AdminJobRecord.exists?(operation: 'import_users')).to be_truthy
    end
  end

  describe 'PUT toggle_status' do
    it 'toggles user status' do
      put :toggle_status, params: { new_campaign_id: campaign.id, id: user.id }
      expect(response).to have_http_status(:success)
    end
  end

  describe 'PUT update_level' do
    it 'updates campaign user level' do
      put :update_level, params: { new_campaign_id: campaign.id, id: user.id, level: 'apply' }
      expect(response).to have_http_status(:success)
      expect(campaign_user.reload.level).to eq('apply')
    end
  end

  describe 'PUT update_job_role' do
    it 'updates campaign user job roles' do
      put :update_job_role, params: {
        new_campaign_id: campaign.id,
        id: user.id,
        current_job_role_id: current_job_role.id,
        target_job_role_id: target_job_role.id
      }
      expect(response).to have_http_status(:success)
      expect(campaign_user.reload.current_job_role_id).to eq(current_job_role.id)
      expect(campaign_user.reload.target_job_role_id).to eq(target_job_role.id)
    end
  end

  describe 'DELETE' do
    it 'removes campaign user and dependant data' do
      campaign_user = create(:campaign_user)
      expect do
        delete :destroy, params: { new_campaign_id: campaign_user.campaign_id, id: campaign_user.user_id }
      end.to change(CampaignUser, :count).by(-1)
      expect(response.body).to eq(campaign_user.user_id.to_s)
    end
  end

  it 'POST search' do
    u = create(:user, email: 'atanych@gmail.com')
    create(:campaign_user, campaign: campaign, user: u)
    post :search, params: { new_campaign_id: campaign.id, q: 'atanych' }

    parsed_response = response.parsed_body
    expect(parsed_response.length).to eq(1)
    expect(parsed_response.first['email']).to eq('atanych@gmail.com')
  end

  private

  def check_user_response(user_response)
    user_response['campaigns'] = user_response['campaigns'].map { |c| c.slice('name', 'id') }
    expect(user_response).to eq({
      'id' => user.id,
      'full_name' => user.decorate.full_name,
      'email' => user.email,
      'status' => 'not_started',
      'completion_status' => 'not_started',
      'created_at' => I18n.l(user.created_at, format: :short),
      'last_sign_in_at' => nil,
      'campaigns' => [campaign.slice('name', 'id')],
      'active' => campaign_user.active,
      'additional_time' => campaign_user.additional_time,
      'completed_at' => nil,
      'started_at' => nil,
      'proctoring_sessions' => [proctoring_response],
      'permissions' => {
        'add_report' => true,
        'regenerate_report' => true,
        'remove' => true,
        'toggle_status' => true,
        'bulk_download' => true,
        'view_recordings' => true,
        'view_workshop_details' => true,
        'view_idp_plan' => true
      },
      'manager' => {},
      'hogan_id' => hogan_credential.participant_id,
      'hogan_provider' => hogan_credential.provider,
      'current_job_role' => {},
      'level' => campaign_user.level,
      'target_job_role' => {}
    })
  end

  def proctoring_response
    results = proctoring_session.results
    {
      'id' => proctoring_session.id,
      'session_id' => proctoring_session.session_id,
      'started_at' => proctoring_session.started_at.as_json,
      'completed_at' => proctoring_session.completed_at.as_json,
      'score' => results['score'],
      'comment' => results['comment'],
      'conclusion' => results['conclusion'],
      'report_url' => results['reportUrl'],
      'archive_url' => results['archive'],
      'assessment_name' => proctoring_session.user_assessment&.assessment&.name
    }
  end

  def check_report_response(report_response, user_report)
    expect(report_response).to include({
      'id' => user_report.id,
      'report_id' => report.id,
      'assessment_ids' => [assessment.id],
      'campaign_id' => campaign.id,
      'name' => report.name,
      'user_access' => user_report.user_access,
      'report_family_name' => report_family.name,
      'status' => 'not_prepared',
      'approval_status' => 'not_ready',
      'internal' => true,
      'custom_upload' => false,
      'report_download_urls' => {
        user_report.effective_default_language => user_report.pdf_download_url(
          locale: user_report.effective_default_language
        )
      },
      'report_provider' => 'internal',
      'external_settings' => {},
      'comments_count' => 0,
      'edits_count' => 0,
      'hogan_participant_id' => nil,
      'effective_default_language' => user_report.effective_default_language,
      'available_languages' => user_report.campaign_report&.available_languages || [],
      'permissions' => {
        'download_report' => true,
        'remove' => true,
        'toggle_access' => true,
        'view_report' => true,
        'push_webhook' => false,
        'remove_file' => true,
        'upload_file' => true
      }
    })
  end

  def check_assessment_response(assessment_response, user_assessment)
    policy = Administration::UserAssessmentPolicy.new(current_user, user_assessment)
    expect(assessment_response).to eq({
      'id' => user_assessment.id,
      'assessment_id' => assessment.id,
      'name' => assessment.name,
      'category' => assessment.category,
      'norm_name' => nil,
      'norms' => [],
      'permissions' => {
        'reset_results' => policy.reset?,
        'update_additional_time' => policy.update_additional_time?,
        'update_norm' => policy.update_norm?,
        'rescore_response' => policy.rescore_response?,
        'rescore_ai_response' => policy.rescore_ai_response?,
        'remove' => policy.destroy?,
        'reset_progress' => policy.reset_progress?,
        'push_webhook' => true,
        'update_mettl_schedule' => false,
        'normalize_factor_scores' => policy.normalize_factor_scores?,
        'update_content_variation' => false,
        'mark_complete' => policy.mark_complete?,
        'update_simulation_time_extension' => false,
        'update_mhs_confidence_interval' => false,
        'update_mhs_leadership_bar' => false,
        'update_mhs_norm_option' => false,
        'update_mhs_norm_region' => false
      },
      'norm_id' => nil,
      'additional_time' => nil,
      'is_expired' => false,
      'is_external' => false,
      'status' => 'not_started',
      'has_external_norm' => false,
      'schedule_time' => nil,
      'require_scheduling' => false,
      'mettl_schedule_name' => nil,
      'mettl_schedule_record_id' => nil,
      'prework' => false,
      'dimension_id' => assessment.dimension_id,
      'simulation_content_variations' => [],
      'hogan_participant_id' => nil,
      'started_at' => nil,
      'completed_at' => nil,
      'pearson_user_assessment_details' => nil,
      'simulation_user_assessment_details' => nil,
      'saville_user_assessment_details' => nil,
      'skillvue_user_assessment_details' => nil,
      'yoodli_user_assessment_details' => nil,
      'mhs_user_assessment_details' => nil,
      'microsite_user_assessment_details' => nil,
      'hogan_user_assessment_details' => nil,
      'users_result_id' => user_assessment.users_result_id
    })
  end
end
