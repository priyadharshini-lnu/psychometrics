# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::VoiceCharacter, type: :model do
  subject(:voice_character) { build(:voice_character) }

  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:external_voice_id) }
  end

  describe 'associations' do
    it { should belong_to(:tenant).class_name('Client').optional }
    it { should belong_to(:last_modified_by).class_name('User').optional }
  end

  describe 'provider enum' do
    it 'defaults to azure' do
      expect(described_class.new.provider).to eq('azure')
    end

    it 'exposes the supported providers' do
      expect(described_class.providers.keys).to contain_exactly('azure')
    end
  end

  describe '#sample_text' do
    it 'returns the default sample translation' do
      expect(voice_character.sample_text).to eq(I18n.t('admin.tts_sample_text'))
    end
  end
end
