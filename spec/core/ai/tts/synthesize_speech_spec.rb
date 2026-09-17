# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::TTS::SynthesizeSpeech, type: :service do
  let(:voice_character) { build(:voice_character) }
  let(:audio_bytes) { 'binary-audio-data' }

  describe '.call' do
    context 'when the text is blank' do
      it 'broadcasts an error without calling the provider' do
        expect(AI::TTS::Providers::Azure).not_to receive(:call!)

        result = described_class.call(voice_character, '  ')

        expect(result[:ok]).to be_nil
        expect(result[:error]).to eq(I18n.t('admin.tts_blank_text'))
      end
    end

    context 'when synthesis succeeds' do
      before do
        allow(AI::TTS::Providers::Azure).to receive(:call!).and_return(audio_bytes)
      end

      it 'broadcasts the audio content and content type' do
        result = described_class.call(voice_character, 'Describe a challenge you faced')

        expect(result[:ok]).to eq(content: audio_bytes, content_type: 'audio/mpeg')
      end
    end

    context 'when the provider raises a synthesis error' do
      before do
        allow(AI::TTS::Providers::Azure).to receive(:call!).and_raise(
          AI::TTS::Providers::Azure::SynthesisError.new('Azure TTS failed')
        )
      end

      it 'broadcasts the error message' do
        result = described_class.call(voice_character, 'Describe a challenge you faced')

        expect(result[:ok]).to be_nil
        expect(result[:error]).to eq('Azure TTS failed')
      end
    end
  end
end
