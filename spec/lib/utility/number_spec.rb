# frozen_string_literal: true

require 'rails_helper'

describe Utility::Number do
  describe '.scale' do
    it do
      expect(
        described_class.scale(0, 0, 1, 1, 5)
      ).to eq(1)
      expect(
        described_class.scale(1, 0, 1, 1, 5)
      ).to eq(5)
      expect(
        described_class.scale(1, 0, 1, 0, 100)
      ).to eq(100)
      expect(
        described_class.scale(0.5, 0, 1, 0, 100)
      ).to eq(50)
      expect(
        described_class.scale(75, 50, 100, 0, 100)
      ).to eq(50)
      expect(
        described_class.scale(0.5, 0, 1, 0, 5)
      ).to eq(2.5)
    end
  end
end
