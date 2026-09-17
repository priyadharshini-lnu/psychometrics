# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::TTS::Providers::Azure, type: :service do
  subject(:synthesize) { described_class.call!(ssml: ssml) }

  let(:ssml) { '<speak>Hello</speak>' }
  let(:endpoint) { 'https://westeurope.tts.speech.microsoft.com/cognitiveservices/v1' }

  context 'when Azure responds successfully' do
    before do
      stub_request(:post, endpoint).
        with(headers: { 'Ocp-Apim-Subscription-Key' => 'azure_speech_key' }, body: ssml).
        to_return(status: 200, body: 'audio-bytes')
    end

    it 'returns the audio bytes' do
      expect(synthesize).to eq('audio-bytes')
    end
  end

  context 'when Azure responds with an error status' do
    before do
      stub_request(:post, endpoint).to_return(status: 401, body: 'Unauthorized')
    end

    it 'raises a synthesis error' do
      expect { synthesize }.to raise_error(described_class::SynthesisError, /401/)
    end
  end

  context 'when the key is missing' do
    before do
      allow(Settings.secrets.azure.speech).to receive(:key).and_return(nil)
    end

    it 'raises a configuration error' do
      expect { synthesize }.to raise_error(described_class::ConfigurationError, /key is missing/)
    end
  end
end
