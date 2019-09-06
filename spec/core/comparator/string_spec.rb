# frozen_string_literal: true

require 'rails_helper'

describe Comparator::String do
  context 'equal comparator' do
    it do
      result = described_class.call!("apple", "apple", "equal")

      expect(result).to eq(true)
    end

    it do
      result = described_class.call!("apple", "oranger", "equal")

      expect(result).to eq(false)
    end
  end

  context 'not_equal comparator' do
    it do
      result = described_class.call!("apple", "apple", "not_equal")

      expect(result).to eq(false)
    end

    it do
      result = described_class.call!("apple", "oranger", "not_equal")

      expect(result).to eq(true)
    end
  end


  context 'starts_with comparator' do
    it do
      result = described_class.call!("appletine", "apple", "starts_with")

      expect(result).to eq(true)
    end

    it do
      result = described_class.call!("martini", "apple", "starts_with")

      expect(result).to eq(false)
    end
  end

  it 'does case insensitive match' do
    result = described_class.call!("Apple", "apple", "equal")

    expect(result).to eq(true)
  end
end
