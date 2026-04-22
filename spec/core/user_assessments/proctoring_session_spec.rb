# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserAssessments::ProctoringSession, type: :model do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:user) { create(:user, project: project) }
  let(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:assessment) { create(:assessment) }
  let(:user_assessment) do
    create(:user_assessment, assessment: assessment, campaign: campaign, subject: user, evaluator: user)
  end
  let(:context) { { params: { id: user_assessment.id }, current_user: user } }

  let(:service) { described_class.new(context) }

  let(:examus_session_url) { 'https://examus.net/integration/simple/test/start/?token=token' }

  before do
    campaign_user # insure creation
    allow_any_instance_of(EndUser::CampaignUserSerializer).
      to receive(:serialize).
      and_return({ 'examus_session_url' => examus_session_url })
  end

  let(:async_response) do
    AsyncResponseRequest::AsyncResponse.new(
      processing_status: :completed,
      response_type: :json,
      response_data: { 'examus_session_url' => examus_session_url }
    )
  end

  describe '#call' do
    context 'when proctoring is enabled' do
      before do
        allow_any_instance_of(UserAssessment).to receive(:proctoring_enabled?).and_return(true)
        allow(Examus::GetSessionUrl).to receive(:call).
          with(
            campaign_user: user_assessment.campaign_user,
            locale: I18n.locale,
            subject: user_assessment
          ).
          and_return({ ok: examus_session_url })
      end

      it 'sets the examus_session_url' do
        expect { service.call }.to broadcast(:ok, async_response)
      end

      context 'Examus API returns an error' do
        let(:error_message) { 'An error occurred' }

        before do
          allow(Examus::GetSessionUrl).to receive(:call).
            with(
              campaign_user: user_assessment.campaign_user,
              locale: I18n.locale,
              subject: user_assessment
            ).
            and_return({ error: error_message })
        end

        let(:failed_async_response) do
          AsyncResponseRequest::AsyncResponse.new(
            processing_status: :failed,
            response_type: :json,
            response_data: { error: error_message }
          )
        end

        it 'broadcasts :invalid with the error message' do
          expect { service.call }.to broadcast(:invalid, failed_async_response)
        end
      end
    end

    context 'when proctoring is not enabled' do
      before do
        allow_any_instance_of(UserAssessment).to receive(:proctoring_enabled?).and_return(false)
      end

      let(:empty_async_response) do
        AsyncResponseRequest::AsyncResponse.new(
          processing_status: :completed,
          response_type: :json,
          response_data: {}
        )
      end

      it 'return invalid response' do
        expect { service.call }.to broadcast(:invalid, empty_async_response)
      end
    end
  end
end
