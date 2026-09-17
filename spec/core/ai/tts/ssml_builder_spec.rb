# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::TTS::SSMLBuilder, type: :service do
  subject(:ssml) { described_class.new(voice_character: voice_character, text: text).call }

  let(:text) { 'How did you handle it?' }

  context 'with a minimal voice character' do
    let(:voice_character) do
      build(:voice_character, external_voice_id: 'en-US-JennyNeural', locale: 'en-US')
    end

    it 'wraps the text in a voice element with the correct language' do
      expect(ssml).to include('xml:lang="en-US"')
      expect(ssml).to include('<voice name="en-US-JennyNeural">How did you handle it?</voice>')
    end

    it 'does not add prosody or style wrappers' do
      expect(ssml).not_to include('<prosody')
      expect(ssml).not_to include('mstts:express-as')
    end
  end

  context 'with style, rate and pitch' do
    let(:voice_character) { build(:voice_character, :with_style) }

    it 'wraps the text in style and prosody elements' do
      expect(ssml).to include('<mstts:express-as style="cheerful">')
      expect(ssml).to include('<prosody rate="+10%" pitch="+2st">')
    end
  end

  context 'when rate and pitch are medium' do
    let(:voice_character) { build(:voice_character, rate: 'medium', pitch: 'medium') }

    it 'omits the neutral prosody wrapper' do
      expect(ssml).not_to include('<prosody')
    end
  end

  context 'when the text contains markup characters' do
    let(:voice_character) { build(:voice_character) }
    let(:text) { 'Tell me about <you> & "them"' }

    it 'escapes the text' do
      expect(ssml).to include('Tell me about &lt;you&gt; &amp; &quot;them&quot;')
    end
  end
end
