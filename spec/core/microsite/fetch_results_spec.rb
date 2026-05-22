# frozen_string_literal: true

require 'rails_helper'

describe Microsite::FetchResults do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:assessment) { create(:assessment, :microsite, project: project) }
  let(:user_assessment) do
    create(:user_assessment, assessment: assessment, campaign: campaign, project: project)
  end
  let(:microsite_user_assessment) do
    create(:microsite_user_assessment, user_assessment: user_assessment, participant_id: 'participant-123')
  end
  let(:config) { { 'api_key' => 'test_api_key', 'base_url' => 'http://localhost:4000' } }

  let(:success_response) do
    {
      'success' => true,
      'data' => {
        'responses' => { 'q1' => 'answer1', 'q2' => 'answer2' },
        'completedAt' => '2026-05-16T10:00:00Z'
      }
    }
  end

  let(:not_found_response) do
    {
      'success' => false,
      'error' => 'Participant not found'
    }
  end

  let(:not_completed_response) do
    {
      'success' => false,
      'error' => 'Assessment not completed'
    }
  end

  let(:client) { instance_double(Faraday::Connection) }
  let(:response) { instance_double(Faraday::Response) }

  subject { described_class.new(microsite_user_assessment) }

  before do
    allow_any_instance_of(described_class).to receive(:config).and_return(config)
    allow(subject).to receive(:client).and_return(client)
  end

  describe '#call' do
    context 'when fetch is successful' do
      before do
        allow(client).to receive(:get).and_return(response)
        allow(response).to receive(:body).and_return(success_response)
        allow(response).to receive(:success?).and_return(true)
      end

      it 'broadcasts :ok with results' do
        expect(subject).to receive(:broadcast).with(:ok, {
          responses: { 'q1' => 'answer1', 'q2' => 'answer2' },
          completed_at: '2026-05-16T10:00:00Z'
        })

        subject.call
      end

      it 'calls correct API endpoint' do
        expect(client).to receive(:get).with('http://localhost:4000/api/v1/participants/participant-123/results')
        subject.call
      end
    end

    context 'when participant not found' do
      before do
        allow(client).to receive(:get).and_return(response)
        allow(response).to receive(:body).and_return(not_found_response)
        allow(response).to receive(:success?).and_return(false)
        allow(response).to receive(:status).and_return(404)
      end

      it 'broadcasts :failed with error message' do
        expect(subject).to receive(:broadcast).with(:failed, 'Participant not found')
        subject.call
      end
    end

    context 'when assessment not completed' do
      before do
        allow(client).to receive(:get).and_return(response)
        allow(response).to receive(:body).and_return(not_completed_response)
        allow(response).to receive(:success?).and_return(false)
        allow(response).to receive(:status).and_return(400)
      end

      it 'broadcasts :failed with error message' do
        expect(subject).to receive(:broadcast).with(:failed, 'Assessment not completed')
        subject.call
      end
    end

    context 'when there is a network error' do
      let(:error) { Faraday::ConnectionFailed.new('Connection failed') }

      before do
        allow(client).to receive(:get).and_raise(error)
        allow(Sentry).to receive(:capture_exception)
      end

      it 'captures exception with Sentry' do
        expect(Sentry).to receive(:capture_exception).with(error, extra: {
          microsite_user_assessment_id: microsite_user_assessment.id,
          participant_id: 'participant-123'
        })

        subject.call
      end

      it 'broadcasts :failed with error message' do
        expect(subject).to receive(:broadcast).with(:failed, 'Connection failed')
        subject.call
      end
    end
  end
end
