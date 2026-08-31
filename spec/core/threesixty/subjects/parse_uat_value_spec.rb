# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Subjects::ParseUatValue do
  describe '.call' do
    it 'returns true for "Yes"' do
      expect(described_class.call('Yes')).to eq(true)
    end

    it 'returns false for "No"' do
      expect(described_class.call('No')).to eq(false)
    end

    it 'returns false for a blank value' do
      expect(described_class.call('')).to eq(false)
      expect(described_class.call(nil)).to eq(false)
      expect(described_class.call('   ')).to eq(false)
    end

    it 'is case-insensitive and ignores surrounding whitespace' do
      expect(described_class.call(' yes ')).to eq(true)
      expect(described_class.call('nO')).to eq(false)
    end

    it 'returns nil for an unrecognised value' do
      expect(described_class.call('maybe')).to be_nil
    end
  end

  describe '.valid?' do
    it 'is true for recognised values regardless of case or whitespace' do
      expect(described_class.valid?('Yes')).to eq(true)
      expect(described_class.valid?('no')).to eq(true)
      expect(described_class.valid?(' YES ')).to eq(true)
    end

    it 'is true for a blank value' do
      expect(described_class.valid?('')).to eq(true)
      expect(described_class.valid?(nil)).to eq(true)
      expect(described_class.valid?('   ')).to eq(true)
    end

    it 'is false for an unrecognised value' do
      expect(described_class.valid?('maybe')).to eq(false)
    end
  end
end
