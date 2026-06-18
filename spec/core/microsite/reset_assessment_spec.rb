# frozen_string_literal: true

require 'rails_helper'

describe Microsite::ResetAssessment do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:assessment) { create(:assessment, :microsite, project: project) }
  let(:user_assessment) do
    create(:user_assessment, assessment: assessment, campaign: campaign, project: project)
  end
  let(:config) { { 'api_key' => 'test_api_key', 'base_url' => 'http://localhost:4000' } }

  let(:client) { instance_double(Faraday::Connection) }
  let(:response) { instance_double(Faraday::Response) }

  subject { described_class.new(user_assessment) }

  before do
    allow_any_instance_of(described_class).to receive(:config).and_return(config)
    allow(subject).to receive(:client).and_return(client)
  end

  describe '#call' do
    context 'when the participant is registered on the microsite' do
      let!(:microsite_user_assessment) do
        create(:microsite_user_assessment,
               user_assessment: user_assessment,
               participant_id: 'participant-uuid',
               registration_status: :registered,
               url: 'http://localhost:4000/assessment/test-123')
      end

      context 'when the reset request succeeds' do
        before do
          allow(client).to receive(:post).and_return(response)
          allow(response).to receive(:success?).and_return(true)
        end

        it 'calls the microsite reset endpoint and broadcasts :ok' do
          expect(client).to receive(:post).
            with('http://localhost:4000/api/v1/participants/participant-uuid/reset').
            and_return(response)

          expect { subject.call }.to broadcast(:ok)
        end
      end

      context 'when the reset request fails' do
        before do
          allow(client).to receive(:post).and_return(response)
          allow(response).to receive(:success?).and_return(false)
          allow(response).to receive(:body).and_return({ 'message' => 'participant is cancelled' })
        end

        it 'raises ResetParticipantFailed' do
          expect { subject.call }.to raise_error(
            Microsite::Exceptions::ResetParticipantFailed, 'participant is cancelled'
          )
        end
      end

      context 'when there is a network error' do
        let(:error) { Faraday::ConnectionFailed.new('Connection failed') }

        before do
          allow(client).to receive(:post).and_raise(error)
          allow(Sentry).to receive(:capture_exception)
        end

        it 'captures the exception with Sentry and re-raises' do
          expect(Sentry).to receive(:capture_exception).with(error, extra: {
            user_assessment_id: user_assessment.id,
            project_id: project.id
          })

          expect { subject.call }.to raise_error(Faraday::ConnectionFailed)
        end
      end
    end

    context 'when the participant is not registered on the microsite' do
      let!(:microsite_user_assessment) do
        create(:microsite_user_assessment,
               user_assessment: user_assessment,
               registration_status: :pending)
      end

      it 'skips the remote call and broadcasts :ok' do
        expect(client).not_to receive(:post)

        expect { subject.call }.to broadcast(:ok)
      end
    end

    context 'when there is no microsite user assessment' do
      it 'skips the remote call and broadcasts :ok' do
        expect(client).not_to receive(:post)

        expect { subject.call }.to broadcast(:ok)
      end
    end
  end
end
