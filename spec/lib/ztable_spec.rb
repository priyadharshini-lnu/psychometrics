# frozen_string_literal: true

require 'rails_helper'

describe Ztable do
  context '.percentile' do
    it 'returns 0.5 if zscore is zero' do
      percentile = described_class.percentile(0) # 10 Kb

      expect(percentile).to eq(50.0)
    end

    it 'returns 1.0 if zscore is greater than max' do
      percentile = described_class.percentile(4)

      expect(percentile).to eq(99.997)
    end

    it 'returns 0.0 if zscore is less then min' do
      percentile = described_class.percentile(-4)

      expect(percentile).to eq(0.003)
    end

    it 'returns percentile for a zscore within range' do
      percentile = described_class.percentile(-0.18263)

      expect(percentile).to eq(42.858)
    end

    it 'returns percentile for a zscore which is integer' do
      percentile = described_class.percentile(3)

      expect(percentile).to eq(99.865)
    end

    # TODO: spec other edge cases
  end
end
