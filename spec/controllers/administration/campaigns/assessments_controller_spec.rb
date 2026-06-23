# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::AssessmentsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:dimension) { create(:dimension) }
  let(:assessment) { create(:assessment, dimension: dimension) }
  let!(:assessor_form) { create(:assessment, category: :assessor_form, name: 'A 1') }
  let!(:campaign_assessment) do
    create(:campaign_assessment, assessment: assessment, campaign: campaign, prework: true)
  end
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
      expect(AdminJob).to_not receive(:call)

      post :update_norm, params: {
        id: assessment.id,
        new_campaign_id: campaign.id,
        apply: false,
        norm_id: norm.id
      }, as: :json

      parsed_response = response.parsed_body

      campaign_assessment.reload

      expect(parsed_response).to eq('norm_name' => 'Norm')
      expect(campaign_assessment.norm_id).to eq(norm.id)
    end

    it 'with apply = true' do
      expect(AdminJob).to receive(:call).
        with(:rescore_assessment, { campaign_id: campaign.id, assessment_id: assessment.id, norm_id: norm.id },
             current_user)

      post :update_norm, params: {
        id: assessment.id,
        new_campaign_id: campaign.id,
        apply: true,
        norm_id: norm.id
      }, as: :json

      parsed_response = response.parsed_body

      expect(parsed_response).to eq('norm_name' => 'Norm')
    end
  end

  it '[PUT] toggle_require_scheduling' do
    expect(campaign_assessment.require_scheduling).to eq(false)

    put :toggle_require_scheduling, params: {
      id: assessment.id,
      new_campaign_id: campaign.id,
      require_scheduling: true
    }, as: :json

    parsed_response = response.parsed_body

    expect(campaign_assessment.reload.require_scheduling).to eq(true)
    expect(parsed_response).to match(hash_including('require_scheduling' => true))
  end

  it '[PUT] update_assessor_form' do
    expect(AdminJob).to_not receive(:call)

    put :update_assessor_form, params: {
      id: assessment.id,
      new_campaign_id: campaign.id,
      apply: false,
      assessor_form_id: assessor_form.id
    }, as: :json

    parsed_response = response.parsed_body

    campaign_assessment.reload

    expect(parsed_response).to eq('assessor_form_name' => 'A 1', 'assessor_form_id' => assessor_form.id)
    expect(campaign_assessment.assessor_form_id).to eq(assessor_form.id)
  end

  describe 'POST rescore_responses' do
    it 'schedules AdminJob' do
      expect(AdminJob).to receive(:call).
        with(:rescore_assessment, { campaign_id: campaign.id, assessment_id: assessment.id,
                                    allow_ai_rescore: false }, current_user)

      post :rescore_responses, params: {
        id: assessment.id,
        new_campaign_id: campaign.id
      }

      expect(response).to have_http_status(:success)
    end
  end

  describe '[POST] export_ai_factor_scores' do
    it 'schedules ai factor score export job with include inactive users payload' do
      allow_any_instance_of(CampaignAssessment).to receive(:has_ai_questions?).and_return(true)

      expect(AdminJob).to receive(:call).with(
        :assessment_raw_ai_factor_export,
        { assessment_id: assessment.id, campaign_id: campaign.id, include_inactive_users: true },
        current_user
      )

      post :export_ai_factor_scores, params: {
        id: assessment.id,
        new_campaign_id: campaign.id,
        include_inactive_users: 'true'
      }, as: :json

      expect(response).to have_http_status(:ok)
    end
  end

  describe 'DELETE' do
    it 'removes campaign_assessment' do
      expect do
        delete :destroy, params: {
          new_campaign_id: campaign.id,
          id: assessment.id
        }
      end.to change(CampaignAssessment, :count).by(-1)
      expect(response.body).to eq(assessment.id.to_s)
      expect(CampaignAssessment.find_by(id: campaign_assessment.id)).to be_nil
    end
  end

  it '[PUT] update_prework' do
    expect(campaign_assessment.prework).to eq(true)
    put :update_prework, params: {
      id: assessment.id,
      new_campaign_id: campaign.id,
      prework: false
    }, as: :json

    parsed_response = response.parsed_body

    expect(campaign_assessment.reload.prework).to eq(false)
    expect(parsed_response).to match(hash_including('prework' => false))
  end

  it '[PUT] update_workshop_activity' do
    expect(campaign_assessment.workshop_activity).to eq(false)
    put :update_workshop_activity, params: {
      id: assessment.id,
      new_campaign_id: campaign.id,
      workshop_activity: true,
      workshop_activity_duration: 4
    }, as: :json

    parsed_response = response.parsed_body

    expect(campaign_assessment.reload.workshop_activity).to eq(true)
    expect(parsed_response).to match(hash_including('workshop_activity' => true))
    expect(parsed_response).to match(hash_including('workshop_activity_duration' => 4))
  end

  describe '[POST] update_mettl_schedule' do
    let!(:assessment) { create(:assessment, type: Assessments::Mettl) }
    let!(:campaign_assessment) { create(:campaign_assessment, assessment: assessment, campaign: campaign) }
    let!(:mettl_schedule_record) { create(:mettl_schedule_record, project: assessment.project, assessment: assessment) }

    let!(:user_assessment) do
      create(:user_assessment, assessment: assessment, campaign: campaign, status: :not_started)
    end
    let!(:mettl_user_assessment) { create(:mettl_user_assessment, user_assessment: user_assessment) }

    let(:mettl_schedule_record_id) { mettl_schedule_record.id }

    it 'with apply = false' do
      post :update_mettl_schedule, params: {
        id: assessment.id,
        new_campaign_id: campaign.id,
        apply: false,
        mettl_schedule_record_id: mettl_schedule_record.id
      }, as: :json

      parsed_response = response.parsed_body

      campaign_assessment.reload

      expect(parsed_response).to eq('mettl_schedule_name' => mettl_schedule_record.schedule_name)
      expect(campaign_assessment.mettl_schedule_record_id).to eq(mettl_schedule_record_id)
      expect(mettl_user_assessment.mettl_schedule_record_id).to eq(nil)
    end

    it 'with apply = true' do
      post :update_mettl_schedule, params: {
        id: assessment.id,
        new_campaign_id: campaign.id,
        apply: true,
        mettl_schedule_record_id: mettl_schedule_record.id
      }, as: :json

      parsed_response = response.parsed_body

      campaign_assessment.reload

      expect(parsed_response).to eq('mettl_schedule_name' => mettl_schedule_record.schedule_name)
      expect(campaign_assessment.mettl_schedule_record_id).to eq(mettl_schedule_record_id)
      expect(mettl_user_assessment.reload.mettl_schedule_record_id).to eq(mettl_schedule_record_id)
    end

    it 'does not update mettl schedule record id if user assessment is not mettl' do
      assessment.update!(type: Assessments::Hogan)

      post :update_mettl_schedule, params: {
        id: assessment.id,
        new_campaign_id: campaign.id,
        apply: true,
        mettl_schedule_record_id: mettl_schedule_record.id
      }, as: :json

      expect(campaign_assessment.reload.mettl_schedule_record_id).to eq(nil)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe '[PUT] update_content_variation' do
    let!(:assessment) { create(:assessment, type: Assessments::Simulation) }
    let!(:campaign_assessment) { create(:campaign_assessment, assessment: assessment, campaign: campaign) }

    let!(:user_assessment) do
      create(:user_assessment, assessment: assessment, campaign: campaign, status: :not_started)
    end
    let!(:simulation_user_assessment) { create(:simulation_user_assessment, user_assessment: user_assessment) }

    it 'with apply = false' do
      put :update_content_variation, params: {
        id: assessment.id,
        new_campaign_id: campaign.id,
        apply: false,
        external_config: { 'content_variation_id' => 'starWars' }.to_json
      }, as: :json

      parsed_response = response.parsed_body

      campaign_assessment.reload

      expect(parsed_response).to eq('content_variation_id' => 'starWars')
      expect(campaign_assessment.external_config['content_variation_id']).to eq('starWars')
    end

    it 'with apply = true' do
      put :update_content_variation, params: {
        id: assessment.id,
        new_campaign_id: campaign.id,
        apply: true,
        external_config: { 'content_variation_id' => 'starWars' }.to_json
      }, as: :json

      parsed_response = response.parsed_body

      campaign_assessment.reload

      expect(parsed_response).to eq('content_variation_id' => 'starWars')
      expect(campaign_assessment.external_config['content_variation_id']).to eq('starWars')
      expect(simulation_user_assessment.reload.content_variation_id).to eq('starWars')
    end

    it 'does not update simulation user assessment record id if user assessment is not simulation' do
      assessment.update!(type: Assessments::Hogan)

      put :update_content_variation, params: {
        id: assessment.id,
        new_campaign_id: campaign.id,
        apply: true,
        external_config: { 'content_variation_id' => 'starWars' }.to_json
      }, as: :json

      expect(campaign_assessment.reload.external_config).to eq(nil)
      expect(response).to have_http_status(:forbidden)
    end
  end
end
