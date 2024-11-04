# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Webhooks::SimulationController, type: :controller do
  let(:project) { create(:project) }
  let(:assessment) { create(:assessment, project: project) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment, project: project) }
  let(:user_result) { create(:users_result, user_assessment: user_assessment) }
  let(:jwt_token) do
    JWT.encode({ data: user_assessment.id, exp: 30.days.from_now.to_i }, Settings.secrets.webhook_jwt_secret, 'HS256')
  end

  describe 'POST #progress_notification' do
    let(:json_payload) do
      {
        event: 'progress_update',
        userId: '22d87cc0-d911-4ca8-9913-1a48520b04c0',
        simulationId: '22d87cc0-d911-4ca8-9913-1a48520b04c0',
        timedOut: false,
        progress: 1,
        token: jwt_token
      }.to_json
    end

    before do
      request.headers['Content-Type'] = 'application/json'
    end

    context 'when user_assessment is not found' do
      before do
        allow(controller).to receive(:find_user_assessment_from_request).and_return(nil)
      end

      it 'returns http status ok' do
        post :progress_notification, params: { project_id: project.id }, body: json_payload
        expect(response).to have_http_status(:ok)
      end
    end

    context 'when user_assessment is found' do
      before do
        allow(controller).to receive(:find_user_assessment_from_request).and_return(user_assessment)
      end

      context 'when progress is provided' do
        it 'updates the user assessment progress to 100%' do
          expect do
            post :progress_notification, params: { project_id: project.id }, body: json_payload
          end.to change { user_result.reload.progress }.to(100)

          expect(response).to have_http_status(:ok)
        end

        it 'completes the user assessment if progress is 100%' do
          post :progress_notification, params: { project_id: project.id }, body: json_payload

          expect(user_assessment.reload).to be_completed
          expect(response).to have_http_status(:ok)
        end
      end

      context 'when progress is not provided' do
        let(:json_payload) do
          {
            event: 'progress_update',
            userId: '22d87cc0-d911-4ca8-9913-1a48520b04c0',
            simulationId: '22d87cc0-d911-4ca8-9913-1a48520b04c0',
            timedOut: false,
            jwt_token: jwt_token
          }.to_json
        end

        it 'does not update the user assessment progress' do
          expect(controller).not_to receive(:update_user_assessment_progress)
          post :progress_notification, params: { project_id: project.id }, body: json_payload
        end
      end

      context 'when user_assessment is completed' do
        before do
          allow(user_assessment).to receive(:completed?).and_return(true)
        end

        it 'enqueues the Simulation::SaveScoresAndReportJob' do
          expect(Simulation::SaveScoresAndReportJob).to receive(:perform_later).with(user_assessment)
          post :progress_notification, params: { project_id: project.id }, body: json_payload
        end
      end

      context 'when assessment is timed out' do
        let(:json_payload) do
          {
            event: 'progress_update',
            userId: '22d87cc0-d911-4ca8-9913-1a48520b04c0',
            simulationId: '22d87cc0-d911-4ca8-9913-1a48520b04c0',
            timedOut: true,
            progress: 0.6,
            token: jwt_token
          }.to_json
        end

        it 'does update the user assessment as timed out' do
          post :progress_notification, params: { project_id: project.id }, body: json_payload

          expect(user_assessment.reload).to be_timed_out
          expect(user_assessment.completion_reason).to eq('time_out_offline')
        end
      end

      it 'returns http status ok' do
        post :progress_notification, params: { project_id: project.id }, body: json_payload
        expect(response).to have_http_status(:ok)
      end
    end

    context 'when the token is invalid' do
      let(:json_payload) do
        {
          event: 'progress_update',
          userId: '22d87cc0-d911-4ca8-9913-1a48520b04c0',
          simulationId: '22d87cc0-d911-4ca8-9913-1a48520b04c0',
          timedOut: false,
          progress: 1,
          jwt_token: 'invalid_token'
        }.to_json
      end

      it 'returns ok status' do
        post :progress_notification, params: { project_id: project.id }, body: json_payload

        expect(response).to have_http_status(:ok)
      end
    end
  end
end
