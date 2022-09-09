# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::PipedText::Branches::DateTimeFields::Other do
  describe '.call' do
    it '+1 day' do
      response = described_class.call!(%w[Other +1d], 'f' => '%-d/%-m/%Y')
      time = 1.day.from_now
      expect(response).to eq(time.strftime('%-d/%-m/%Y'))
    end

    it '-1 day' do
      response = described_class.call!(%w[Other -1d], 'f' => '%-d/%-m/%Y')
      time = 1.day.ago
      expect(response).to eq(time.strftime('%-d/%-m/%Y'))
    end

    it '+2d' do
      response = described_class.call!(%w[Other +2d], 'f' => '%-d/%-m/%Y')
      time = 2.days.from_now
      expect(response).to eq(time.strftime('%-d/%-m/%Y'))
    end

    it '-2d' do
      response = described_class.call!(%w[Other -2d], 'f' => '%-d/%-m/%Y')
      time = 2.days.ago
      expect(response).to eq(time.strftime('%-d/%-m/%Y'))
    end

    it '+1w' do
      response = described_class.call!(%w[Other +1w], 'f' => '%-d/%-m/%Y')
      time = 1.week.from_now
      expect(response).to eq(time.strftime('%-d/%-m/%Y'))
    end

    it '-1w' do
      response = described_class.call!(%w[Other -1w], 'f' => '%-d/%-m/%Y')
      time = 1.week.ago
      expect(response).to eq(time.strftime('%-d/%-m/%Y'))
    end

    it '+1w' do
      response = described_class.call!(%w[Other +1y], 'f' => '%-d/%-m/%Y')
      time = 1.year.from_now
      expect(response).to eq(time.strftime('%-d/%-m/%Y'))
    end

    it '-1w' do
      response = described_class.call!(%w[Other -1y], 'f' => '%-d/%-m/%Y')
      time = 1.year.ago
      expect(response).to eq(time.strftime('%-d/%-m/%Y'))
    end

    it do
      response = described_class.call!(%w[Other -1d], {})
      expect(response).to eq('')
    end
  end
end
