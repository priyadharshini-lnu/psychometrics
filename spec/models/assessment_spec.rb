# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessment, type: :model do
  it { should validate_presence_of(:type) }
  it { should validate_inclusion_of(:type).in_array(Assessment::TYPES.values) }

  describe '#saville?' do
    it 'returns true for saville assessment' do
      assessment = build(:assessment, type: Assessment::TYPES[:saville])

      expect(assessment.saville?).to eq(true)
    end

    it 'returns false for non saville assessment' do
      assessment = build(:assessment, type: Assessment::TYPES[:common])

      expect(assessment.saville?).to eq(false)
    end
  end
end
