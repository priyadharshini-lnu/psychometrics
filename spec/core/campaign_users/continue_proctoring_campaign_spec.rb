# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CampaignUsers::ContinueProctoringCampaign, type: :model do
  let(:campaign_user) { create(:campaign_user) }
  let(:current_user) { campaign_user.user }
  let(:context) { { params: { id: campaign_user.id }, current_user: current_user } }

  let(:service) { described_class.new(context) }

  let(:examus_session_url) { 'https://examus.net/integration/simple/test/start/?token=token' }
  let(:async_response) do
    AsyncResponseRequest::AsyncResponse.new(
      processing_status: :completed,
      response_type: :json,
      response_data: {
        'examus_session_url' => examus_session_url,
        'id' => campaign_user.id,
        'started_at' => nil,
        'status' => 'not_started',
        'expiry_date' => campaign_user.real_expiry_date,
        'all_preworks_completed' => true
      }
    )
  end

  describe '#call' do
    context 'when proctoring is enabled' do
      before do
        allow_any_instance_of(CampaignUser).to receive(:proctoring_enabled?).and_return(true)
        allow(Examus::GetSessionUrl).to receive(:call).with(
          campaign_user: campaign_user,
          locale: I18n.locale,
          system_check_session_id: nil
        ).and_return({ ok: examus_session_url })
      end

      it 'sets the examus_session_url' do
        expect { service.call }.to broadcast(:ok, async_response)
      end

      context 'when system_check_session_id is present' do
        let(:system_check_session_id) { 'system-check-session-123' }
        let(:context) do
          {
            params: {
              id: campaign_user.id,
              system_check_session_id: system_check_session_id
            },
            current_user: current_user
          }
        end

        before do
          allow_any_instance_of(CampaignUser).to receive(:proctoring_enabled?).and_return(true)
          allow(Examus::GetSessionUrl).to receive(:call).and_return({ ok: examus_session_url })
        end

        it 'passes the system_check_session_id to Examus::GetSessionUrl' do
          expect(Examus::GetSessionUrl).to receive(:call).with(
            campaign_user: campaign_user,
            locale: I18n.locale,
            system_check_session_id: system_check_session_id
          ).and_return({ ok: examus_session_url })

          service.call
        end

        it 'sets the examus_session_url' do
          expect { service.call }.to broadcast(:ok, async_response)
        end
      end

      context 'Examus API returns an error' do
        let(:error_message) { 'An error occurred' }

        before do
          allow_any_instance_of(CampaignUser).to receive(:proctoring_enabled?).and_return(true)
          allow(Examus::GetSessionUrl).to receive(:call).with(
            campaign_user: campaign_user,
            locale: I18n.locale,
            system_check_session_id: nil
          ).and_return({ error: error_message })
        end

        it 'broadcasts :invalid with the error message' do
          expect { service.call }.to broadcast(:invalid, instance_of(AsyncResponseRequest::AsyncResponse))
          async_response.response_data = { error: error_message }
          async_response.processing_status = :failed

          expect { service.call }.to broadcast(:invalid, async_response)
        end
      end
    end

    context 'when proctoring is not enabled' do
      before do
        allow_any_instance_of(CampaignUser).to receive(:proctoring_enabled?).and_return(false)
      end

      it 'return invalid response' do
        async_response.response_data = {}

        expect { service.call }.to broadcast(:invalid, async_response)
      end
    end
  end
end
