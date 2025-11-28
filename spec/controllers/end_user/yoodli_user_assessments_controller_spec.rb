# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::YoodliUserAssessmentsController, type: :controller do
  let(:user) { create(:user, :with_project_membership) }
  let(:assessment) { create(:assessment, :yoodli) }
  let(:user_assessment) do
    create(:user_assessment,
           evaluator: user,
           subject: user,
           assessment: assessment)
  end
  let(:campaign) { user_assessment.campaign }
  let(:request_params) { { id: user_assessment.id, yoodli_user_assessment: { id: user_assessment.id } } }
  let(:integration) { create(:integration, :yoodli) }
  let(:launch_data) do
    {
      login_url: 'https://yoodli.example.com/login',
      params: {
        iss: 'https://example.com',
        client_id: '123',
        login_hint: 'user123',
        lti_message_hint: 'product456',
        lti_deployment_id: '789',
        target_link_uri: 'https://yoodli.example.com/launch'
      }
    }
  end

  before do
    login_user(user)
    controller.instance_variable_set(:@current_project, user.project)
  end

  after { sign_out(user) }

  describe 'POST #pass' do
    before do
      allow(UserAssessments::CanStartBasedOnSequencing).to receive(:call!).and_return(true)
      allow(Lti::StartLaunch).to receive(:call).and_return({ ok: launch_data })
    end

    context 'with valid parameters and successful LTI launch' do
      it 'returns successful JSON response with launch data' do
        post :pass, params: request_params

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to eq('application/json; charset=utf-8')

        json_response = response.parsed_body
        expect(json_response).to have_key('login_url')
        expect(json_response).to have_key('params')
        expect(json_response['login_url']).to eq(launch_data[:login_url])
        expect(json_response['params']).to eq(launch_data[:params].stringify_keys)
      end

      it 'calls StartLaunch service with correct context' do
        expect(Lti::StartLaunch).to receive(:call) do |context|
          expect(context[:project]).to eq(user.project)
          expect(context[:current_user]).to eq(user)
          expect(context[:meta]).to eq({ user_assessment_id: user_assessment.id })
          expect(context[:integration]).to eq(:yoodli)
          expect(context[:params]['id']).to eq(user_assessment.id.to_s)
          { ok: launch_data }
        end

        post :pass, params: request_params
      end

      it 'sets user assessment instance variable' do
        post :pass, params: request_params

        expect(assigns(:user_assessment)).to eq(user_assessment)
      end

      it 'includes correct metadata in LTI launch context' do
        expect(Lti::StartLaunch).to receive(:call) do |context|
          expect(context[:meta]).to eq({ user_assessment_id: user_assessment.id })
          { ok: launch_data }
        end

        post :pass, params: request_params
      end

      it 'specifies yoodli integration in LTI launch' do
        expect(Lti::StartLaunch).to receive(:call) do |context|
          expect(context[:integration]).to eq(:yoodli)
          { ok: launch_data }
        end

        post :pass, params: request_params
      end

      it 'permits only id parameter from yoodli_user_assessment' do
        extended_params = request_params.merge(
          yoodli_user_assessment: {
            id: user_assessment.id,
            unauthorized_param: 'should_be_filtered'
          }
        )

        expect(Lti::StartLaunch).to receive(:call) do |context|
          expect(context[:params]['id']).to eq(user_assessment.id.to_s)
          expect(context[:params].keys).to eq(['id'])
          { ok: launch_data }
        end

        post :pass, params: extended_params
      end
    end

    context 'when LTI launch fails' do
      let(:error_message) { 'LTI launch failed' }

      before do
        allow(Lti::StartLaunch).to receive(:call).and_return({ error: error_message })
      end

      it 'returns unprocessable entity status' do
        post :pass, params: request_params

        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns error message in JSON response' do
        post :pass, params: request_params

        json_response = response.parsed_body
        expect(json_response).to have_key('error')
        expect(json_response['error']).to eq(error_message)
      end

      it 'does not include launch_url in response' do
        post :pass, params: request_params

        json_response = response.parsed_body
        expect(json_response).not_to have_key('launch_url')
      end
    end

    context 'when user assessment cannot be started based on sequencing' do
      before do
        allow(UserAssessments::CanStartBasedOnSequencing).to receive(:call!).and_return(false)
      end

      it 'redirects to campaign path' do
        post :pass, params: request_params

        expect(response).to redirect_to(campaign_path(campaign.id))
      end

      it 'does not call StartLaunch service' do
        expect(Lti::StartLaunch).not_to receive(:call)

        post :pass, params: request_params
      end
    end

    context 'when user assessment cannot be found' do
      let(:invalid_params) { { id: 'non-existent-id', yoodli_user_assessment: { id: 'non-existent-id' } } }

      it 'sets user assessment to nil' do
        post :pass, params: invalid_params

        expect(assigns(:user_assessment)).to be_nil
      end

      it 'includes empty metadata when user assessment is nil' do
        expect(Lti::StartLaunch).to receive(:call) do |context|
          expect(context[:meta]).to eq({})
          { ok: launch_data }
        end

        post :pass, params: invalid_params
      end
    end

    context 'when user assessment belongs to different evaluator' do
      let(:other_user) { create(:user) }
      let(:other_user_assessment) do
        create(:user_assessment,
               evaluator: other_user,
               subject: other_user,
               assessment: assessment)
      end
      let(:unauthorized_params) do
        { id: other_user_assessment.id, yoodli_user_assessment: { id: other_user_assessment.id } }
      end

      it 'does not find user assessment for different evaluator' do
        post :pass, params: unauthorized_params

        expect(assigns(:user_assessment)).to be_nil
      end
    end

    context 'when UserAssessments::CanStartBasedOnSequencing raises error' do
      before do
        allow(UserAssessments::CanStartBasedOnSequencing).to receive(:call!).and_raise(StandardError,
                                                                                       'Sequencing error')
      end

      it 'allows the error to propagate' do
        expect { post :pass, params: request_params }.to raise_error(StandardError, 'Sequencing error')
      end
    end
  end
end
