# frozen_string_literal: true

require 'rails_helper'

describe SpeedTest::GenerateTestData do
  describe '.call' do
    it 'generates data of the exact requested size' do
      size = 100_000
      total_bytes = described_class.call(size).sum(&:bytesize)

      expect(total_bytes).to eq(size)
    end

    it 'generates data in chunks for large sizes' do
      chunks = described_class.call(200_000).to_a

      expect(chunks.length).to be > 1
    end

    it 'generates binary data' do
      chunk = described_class.call(1024).first

      expect(chunk.encoding).to eq(Encoding::ASCII_8BIT)
    end

    it 'handles size smaller than chunk size' do
      size = 100
      chunks = described_class.call(size).to_a

      expect(chunks.length).to eq(1)
      expect(chunks.first.bytesize).to eq(size)
    end
  end
end
