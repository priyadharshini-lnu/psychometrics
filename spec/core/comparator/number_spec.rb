# frozen_string_literal: true

require 'rails_helper'

describe Comparator::Number do
  context 'equal comparator' do
    it do
      result = described_class.call!(2, 2, 'equal')

      expect(result).to eq(true)
    end

    it do
      result = described_class.call!(2, 3, 'equal')

      expect(result).to eq(false)
    end
  end

  context 'not_equal comparator' do
    it do
      result = described_class.call!(2, 2, 'not_equal')

      expect(result).to eq(false)
    end

    it do
      result = described_class.call!(2, 3, 'not_equal')

      expect(result).to eq(true)
    end
  end

  context 'less_than comparator' do
    it do
      result = described_class.call!(2, 3, 'less_than')

      expect(result).to eq(true)
    end

    it do
      result = described_class.call!(3, 2, 'less_than')

      expect(result).to eq(false)
    end
  end

  context 'more_than comparator' do
    it do
      result = described_class.call!(2, 3, 'more_than')

      expect(result).to eq(false)
    end

    it do
      result = described_class.call!(3, 2, 'more_than')

      expect(result).to eq(true)
    end
  end
end
