# frozen_string_literal: true

require 'rails_helper'

describe Utility::Hash do
  describe '.match?' do
    it 'returns true if attributes of both hash matches' do
      result = described_class.match?(
        { a: 1, b: 2, c: 3 },
        { a: 1, b: 2, c: 4 },
        %i[a b]
      )

      expect(result).to eq(true)
    end

    it 'returns false if attributes of both hash matches' do
      result = described_class.match?(
        { a: 1, b: 2, c: 3 },
        { a: 1, b: 3, c: 4 },
        %i[a b]
      )

      expect(result).to eq(false)
    end
  end
end
