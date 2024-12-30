# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::UserAssessmentsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:dimension) { create(:dimension) }
  let(:assessment) { create(:assessment, dimension: dimension) }
  let!(:campaign_assessment) { create(:campaign_assessment, assessment: assessment, campaign: campaign) }
  let!(:norm) { create(:norm, name: 'Norm', dimension: dimension) }
  let!(:report) { create(:report, assessments: [assessment]) }
  let(:report_family) { report.report_families.first }
  let(:user) { create(:user) }
  let(:users_result) do
    create(
      :users_result,
      subject: user,
      evaluator: user,
      campaign: campaign,
      assessment: assessment,
      status: :completed
    )
  end

  let!(:user_assessment) do
    users_result.user_assessment.update(expiry_date: 1.year.ago)
    users_result.user_assessment
  end
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }

  let!(:user_report) do
    create(
      :user_report, user: user, campaign: campaign, report: assessment.reports.first, status: :prepared
    )
  end

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  it '[POST] update_norm' do
    user_assessment.update!(status: :not_started)
    post :update_norm, params: {
      id: user_assessment.id,
      new_campaign_id: campaign.id,
      norm_id: norm.id
    }, as: :json

    parsed_response = JSON.parse(response.body)

    users_result.reload

    expect(parsed_response).to eq('norm_name' => 'Norm')
    expect(users_result.norm_id).to eq(norm.id)
  end

  it '[POST] update_additional_time' do
    post :update_additional_time, params: {
      id: user_assessment.id,
      new_campaign_id: campaign.id,
      additional_time: 10
    }, as: :json

    parsed_response = JSON.parse(response.body)
    user_assessment.reload

    expect(user_assessment.additional_time).to eq(600)
    expect(user_assessment.status).to eq('interrupted')
    expect(user_assessment.expiry_date).to be_nil
    expect(parsed_response.dig('user_assessments', 0, 'id')).to eq(user_assessment.id)
    expect(parsed_response['id']).to eq(user.id)
    expect(parsed_response['user_reports'].class).to be(Array)
    expect(user_report.reload.status).to eq('not_prepared')
  end

  it '[POST] rescore_responses' do
    expect(AdminJob).to receive(:call)

    post :rescore_response, params: {
      id: user_assessment.id,
      new_campaign_id: campaign.id
    }

    expect(response).to have_http_status(:success)
  end

  it '[POST] reset' do
    post :reset, params: {
      id: user_assessment.id,
      new_campaign_id: campaign.id
    }

    parsed_response = JSON.parse(response.body)
    expect(parsed_response.dig('user_assessments', 0, 'id')).to eq(user_assessment.id)
    expect(parsed_response['id']).to eq(user.id)
    expect(parsed_response['user_reports'].class).to be(Array)
  end

  describe 'DELETE' do
    it 'removes user_assessment' do
      expect do
        delete :destroy, params: {
          new_campaign_id: campaign.id,
          id: user_assessment.id
        }
      end.to change(UserAssessment, :count).by(-1)
      parsed_response = JSON.parse(response.body)

      expect(parsed_response['user_assessments']).to be_empty
      expect(parsed_response['id']).to eq(user.id)
      expect(parsed_response['user_reports'].class).to be(Array)
    end
  end

  describe 'POST update_mettl_schedule' do
    let(:mettl_schedule_record_id) { 10_000_024 }
    let!(:mettl_schedule_record) { create(:mettl_schedule_record, project: assessment.project, assessment: assessment) }
    let!(:mettl_user_assessment) do
      create(:mettl_user_assessment, user_assessment: user_assessment)
    end

    it 'updates mettl schedule record id' do
      assessment.update!(type: Assessments::Mettl)
      user_assessment.update!(status: 'not_started')

      post :update_mettl_schedule, params: {
        mettl_schedule_record_id: mettl_schedule_record_id,
        campaign_assessment_id: user_assessment.id,
        new_campaign_id: campaign.id,
        id: user_assessment.id
      }, format: :json

      expect(mettl_user_assessment.reload.mettl_schedule_record_id).to eq(mettl_schedule_record_id)
      expect(response).to have_http_status(:success)
    end

    it 'does not update mettl schedule record id if user assessment is completed' do
      assessment.update!(type: Assessments::Mettl)
      user_assessment.update!(status: 'completed')
      original_mettl_schedule_record_id = mettl_user_assessment.mettl_schedule_record_id

      post :update_mettl_schedule, params: {
        mettl_schedule_record_id: mettl_schedule_record_id,
        campaign_assessment_id: user_assessment.id,
        new_campaign_id: campaign.id,
        id: user_assessment.id
      }, format: :json

      expect(mettl_user_assessment.reload.mettl_schedule_record_id).to eq(original_mettl_schedule_record_id)
      expect(response).to have_http_status(:forbidden)
    end

    it 'does not update mettl schedule record id if user assessment is not mettl' do
      assessment.update!(type: Assessments::Hogan)
      user_assessment.update!(status: 'not_started')
      original_mettl_schedule_record_id = mettl_user_assessment.mettl_schedule_record_id

      post :update_mettl_schedule, params: {
        mettl_schedule_record_id: mettl_schedule_record_id,
        campaign_assessment_id: user_assessment.id,
        new_campaign_id: campaign.id,
        id: user_assessment.id
      }, format: :json

      expect(mettl_user_assessment.reload.mettl_schedule_record_id).to eq(original_mettl_schedule_record_id)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'PUT update_content_variation' do
    let!(:simulation_user_assessment) { create(:simulation_user_assessment, user_assessment: user_assessment) }

    it 'updates content_variation_id in simulation user assessment' do
      assessment.update!(type: Assessments::Simulation)
      user_assessment.update!(status: 'not_started')

      post :update_content_variation, params: {
        content_variation_id: 'starWars',
        campaign_assessment_id: user_assessment.id,
        new_campaign_id: campaign.id,
        id: user_assessment.id
      }, format: :json

      expect(simulation_user_assessment.reload.content_variation_id).to eq('starWars')
      expect(response).to have_http_status(:success)
    end

    it 'does not update content_variation_id if user assessment is completed' do
      assessment.update!(type: Assessments::Simulation)
      user_assessment.update!(status: 'completed')
      original_content_variation_id = simulation_user_assessment.content_variation_id

      post :update_mettl_schedule, params: {
        content_variation_id: 'starWars',
        campaign_assessment_id: user_assessment.id,
        new_campaign_id: campaign.id,
        id: user_assessment.id
      }, format: :json

      expect(simulation_user_assessment.reload.content_variation_id).to eq(original_content_variation_id)
      expect(response).to have_http_status(:forbidden)
    end

    it 'does not update content_variation_id  if user assessment is not mettl' do
      assessment.update!(type: Assessments::Hogan)
      user_assessment.update!(status: 'not_started')
      original_content_variation_id = simulation_user_assessment.content_variation_id

      post :update_mettl_schedule, params: {
        content_variation_id: 'starWars',
        campaign_assessment_id: user_assessment.id,
        new_campaign_id: campaign.id,
        id: user_assessment.id
      }, format: :json

      expect(simulation_user_assessment.reload.content_variation_id).to eq(original_content_variation_id)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'PUT update_simulation_time_extension' do
    let!(:simulation_user_assessment) { create(:simulation_user_assessment, user_assessment: user_assessment) }

    it 'updates time_extension in simulation user assessment' do
      assessment.update!(type: Assessments::Simulation)
      user_assessment.update!(status: 'not_started')

      post :update_simulation_time_extension, params: {
        time_extension: 1.5,
        campaign_assessment_id: user_assessment.id,
        new_campaign_id: campaign.id,
        id: user_assessment.id
      }, format: :json

      expect(simulation_user_assessment.reload.time_extension).to eq(1.5)
      expect(response).to have_http_status(:success)
    end

    it 'does not update time_extension if user assessment is completed' do
      assessment.update!(type: Assessments::Simulation)
      user_assessment.update!(status: 'completed')
      original_time_extension = simulation_user_assessment.time_extension

      post :update_simulation_time_extension, params: {
        time_extension: 1.5,
        campaign_assessment_id: user_assessment.id,
        new_campaign_id: campaign.id,
        id: user_assessment.id
      }, format: :json

      expect(simulation_user_assessment.reload.time_extension).to eq(original_time_extension)
      expect(response).to have_http_status(:forbidden)
    end

    it 'does not update time_extension if user assessment is not simulation' do
      assessment.update!(type: Assessments::Hogan)
      user_assessment.update!(status: 'not_started')
      original_time_extension = simulation_user_assessment.time_extension

      post :update_mettl_schedule, params: {
        time_extension: 1.6,
        campaign_assessment_id: user_assessment.id,
        new_campaign_id: campaign.id,
        id: user_assessment.id
      }, format: :json

      expect(simulation_user_assessment.reload.time_extension).to eq(original_time_extension)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'POST normalize_factor_scores' do
    let(:factor) { create(:factor) }
    let!(:user_result_with_scoring) do
      create(
        :users_result,
        subject: user,
        evaluator: user,
        campaign: campaign,
        assessment: assessment,
        scoring: { factor.id.to_s => { score: 2.3 } }
      )
    end
    let!(:project_assessment) do
      create(
        :project_assessment,
        project_id: user_result_with_scoring.campaign.project_id,
        assessment_id: user_result_with_scoring.user_assessment.assessment_id,
        normalize_factor_scores: true
      )
    end

    it 'normalizes factor scores ' do
      post :normalize_factor_scores, params: {
        id: user_result_with_scoring.user_assessment.id,
        new_campaign_id: campaign.id
      }, format: :json

      expect(response).to have_http_status(:success)
    end

    it 'returns error if scoring for users_result is not present' do
      post :normalize_factor_scores, params: {
        id: user_assessment.id,
        new_campaign_id: campaign.id
      }, format: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)).to eq(
        'errors' => [I18n.t('user_assessments.normalize_factor_scores.no_scoring_data')]
      )
    end
  end
end
