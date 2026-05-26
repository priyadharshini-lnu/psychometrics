# frozen_string_literal: true

require 'rails_helper'

describe Microsite::CancelParticipant do
  let(:project) { create(:project) }
  let(:participant_id) { 'participant-123' }
  let(:config) { { 'api_key' => 'test_api_key', 'base_url' => 'http://localhost:4000' } }

  let(:client) { instance_double(Faraday::Connection) }
  let(:response) { instance_double(Faraday::Response) }

  subject { described_class.new(participant_id: participant_id, project_id: project.id) }

  before do
    allow(project).to receive(:microsite_config).and_return(config)
    allow(Client).to receive(:find).with(project.id).and_return(project)
    allow(subject).to receive(:client).and_return(client)
  end

  describe '#call' do
    context 'when cancellation is successful' do
      before do
        allow(client).to receive(:post).and_return(response)
        allow(response).to receive(:success?).and_return(true)
      end

      it 'broadcasts :ok' do
        expect(subject).to receive(:broadcast).with(:ok)
        subject.call
      end

      it 'calls the remove endpoint with participant_id' do
        expect(client).to receive(:post).with('http://localhost:4000/api/v1/participants/participant-123/remove')
        subject.call
      end
    end

    context 'when config is blank' do
      before do
        allow(project).to receive(:microsite_config).and_return(nil)
      end

      it 'does not call the API' do
        expect(client).not_to receive(:post)
        subject.call
      end

      it 'broadcasts :ok' do
        expect(subject).to receive(:broadcast).with(:ok)
        subject.call
      end
    end

    context 'when base_url is blank' do
      before do
        allow(project).to receive(:microsite_config).and_return({ 'api_key' => 'key', 'base_url' => nil })
        allow(Settings.microsite).to receive(:base_api_url).and_return(nil)
      end

      it 'does not call the API' do
        expect(client).not_to receive(:post)
        subject.call
      end
    end

    context 'when api_key is blank' do
      before do
        allow(project).to receive(:microsite_config).and_return({ 'api_key' => nil, 'base_url' => 'http://localhost' })
      end

      it 'does not call the API' do
        expect(client).not_to receive(:post)
        subject.call
      end
    end

    context 'when API returns failure' do
      let(:error_response) { { 'success' => false, 'message' => 'Participant not found' } }

      before do
        allow(client).to receive(:post).and_return(response)
        allow(response).to receive(:success?).and_return(false)
        allow(response).to receive(:body).and_return(error_response)
      end

      it 'does not raise an error' do
        expect { subject.call }.not_to raise_error
      end

      it 'broadcasts :failed with message' do
        expect(subject).to receive(:broadcast).with(:failed, 'Participant not found')
        subject.call
      end
    end

    context 'when there is a network error' do
      let(:error) { Faraday::ConnectionFailed.new('Connection failed') }

      before do
        allow(client).to receive(:post).and_raise(error)
        allow(Sentry).to receive(:capture_exception)
      end

      it 'does not raise an error' do
        expect { subject.call }.not_to raise_error
      end

      it 'broadcasts :failed' do
        expect(subject).to receive(:broadcast).with(:failed, 'Connection failed')
        subject.call
      end

      it 'captures exception in Sentry' do
        expect(Sentry).to receive(:capture_exception).with(error, anything)
        subject.call
      end
    end
  end
end
