# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::UserIdpPlansController, type: :controller do
  let(:current_password) { 'Current@Password129' }
  let!(:user) { create(:user, :with_project_membership, password: current_password) }
  let(:campaign) { create(:campaign) }
  let(:user_idp_plan) { create(:user_idp_plan, user: user, campaign: campaign) }
  let(:behavioral_skill) { create(:skill, skill_type: :behavioral) }
  let(:technical_skill) { create(:skill, skill_type: :technical) }
  let(:other_skill) { create(:skill, skill_type: :other) }
  let(:structured_learning) { create(:development_action, learning_style: :structured_learning) }
  let(:learning_from_others) { create(:development_action, learning_style: :learning_from_others) }
  let(:on_the_job) { create(:development_action, learning_style: :on_the_job) }
  let!(:reflection_question) { create(:reflection_question, project_id: campaign.project_id) }
  let!(:idp_template_reflection_questions) do
    user_idp_plan.idp_template.reflection_questions << reflection_question
    user_idp_plan.idp_template.save!
  end

  let!(:development_actions) do
    [
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, skill: behavioral_skill,
        development_action: structured_learning, progress: 30),

      create(:user_idp_development_action, user_idp_plan: user_idp_plan, skill: technical_skill,
        development_action: learning_from_others, progress: 70),
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, skill: technical_skill,
        development_action: on_the_job, progress: 0),
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, skill: other_skill,
        development_action: on_the_job, progress: 90)
    ]
  end

  before(:each) { login_user(user) }
  after(:each) { sign_out(user) }

  describe 'GET summary' do
    it 'get user idp plan summary' do
      get :summary, params: { user_id: user.id }
      parsed_result = response.parsed_body

      expect(parsed_result).to eq({
        'skills_by_skill_type_count' => { 'behavioral' => 1, 'technical' => 2, 'other' => 1, 'qualification' => 0 },
        'development_actions_by_learning_style_count' => { 'structured_learning' => 1, 'learning_from_others' => 1,
                                                           'on_the_job' => 2 },
        'skill_progress_by_skill_type' => {
          'behavioral' => 30.0,
          'technical' => 35.0,
          'qualification' => 0.0,
          'other' => 90.0
        }
      })
    end
  end

  describe 'GET show' do
    it 'returns user idp plan' do
      get :show, params: { user_id: user.id, id: user_idp_plan.id }
      expect(response).to have_http_status(:ok)
      parsed_result = response.parsed_body

      expect(parsed_result['data']['status']).to eq('not_started')
      expect(parsed_result['data']['self_rating_enabled']).to be true
      expect(parsed_result['data']['skill_gap_report_available']).to be false
      expect(parsed_result['data']['reflection_questions'].first['id']).to eq(reflection_question.id)
    end
  end

  describe 'PUT update_reflection_questions' do
    let(:reflection_questions_params) do
      [
        { id: reflection_question.id, answer: 'This is a reflection answer' }
      ]
    end
    it 'updates user reflection questions' do
      put :update_reflection_questions, params: {
        user_id: user.id,
        reflection_questions: reflection_questions_params
      }

      expect(response).to have_http_status(:ok)
      parsed_result = response.parsed_body

      expect(parsed_result['data'].first['id']).to eq(reflection_question.id)
      expect(parsed_result['data'].first['answer']).to eq('This is a reflection answer')
    end
  end

  describe 'PUT update' do
    context 'when status and note update is successful' do
      before do
        user_idp_plan.update(completion_status: 'in_progress', approval_status: 'approved')
      end
      let(:status) { 'completed' }
      it 'returns ok and updates status' do
        put :update, params: { user_id: user.id, status: status }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body).to eq({ 'note' => nil, 'status' => status })
      end

      it 'updates note along with status' do
        note = 'This is a note for IDP plan'
        user_idp_plan.update(approval_status: 'in_review', completion_status: 'not_started')
        put :update, params: { user_id: user.id, status: 'approved', note: note }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body).to eq({ 'note' => note, 'status' => 'approved' })
      end
    end

    context 'when status update fails' do
      let(:status) { 'approved' }
      let(:error_message) { 'You are not allowed to update to this status.' }
      before do
        allow_any_instance_of(Idp::UpdateStatusForm).to receive(:valid?).
          and_return(false)
      end

      it 'returns unprocessable_entity and error message' do
        put :update, params: { user_id: user.id, user_idp_plan: { status: status } }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe 'async download' do
    it 'initiates async download' do
      allow(AsyncRequestHandlerJob).to receive(:perform_later) do |**args|
        AsyncRequestHandlerJob.perform_now(**args)
      end

      expect(Idp::AsyncDownload).to receive(:call!)
      expect(AsyncResponseRequest::SetAsyncResponse).to receive(:call!).at_least(1)

      post :download, params: {
        user_id: user.id,
        lang: 'en',
        include_reflective_questions: true
      }

      expect(response).to have_http_status(:ok)
    end
  end
end
