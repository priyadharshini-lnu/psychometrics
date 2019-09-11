# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::PipedText::Branches::DateTimeFields::Other do
  describe '.call' do
    it '+1 day' do
      response = described_class.call!(%w[Other +1d], 'f' => '%-d/%-m/%Y')
      time = Time.now + 1.day
      expect(response).to eq(time.strftime('%-d/%-m/%Y'))
    end

    it '-1 day' do
      response = described_class.call!(%w[Other -1d], 'f' => '%-d/%-m/%Y')
      time = Time.now - 1.day
      expect(response).to eq(time.strftime('%-d/%-m/%Y'))
    end

    it '+2d' do
      response = described_class.call!(%w[Other +2d], 'f' => '%-d/%-m/%Y')
      time = Time.now + 2.day
      expect(response).to eq(time.strftime('%-d/%-m/%Y'))
    end

    it '-2d' do
      response = described_class.call!(%w[Other -2d], 'f' => '%-d/%-m/%Y')
      time = Time.now - 2.day
      expect(response).to eq(time.strftime('%-d/%-m/%Y'))
    end

    it '+1w' do
      response = described_class.call!(%w[Other +1w], 'f' => '%-d/%-m/%Y')
      time = Time.now + 1.week
      expect(response).to eq(time.strftime('%-d/%-m/%Y'))
    end

    it '-1w' do
      response = described_class.call!(%w[Other -1w], 'f' => '%-d/%-m/%Y')
      time = Time.now - 1.week
      expect(response).to eq(time.strftime('%-d/%-m/%Y'))
    end

    it '+1w' do
      response = described_class.call!(%w[Other +1y], 'f' => '%-d/%-m/%Y')
      time = Time.now + 1.year
      expect(response).to eq(time.strftime('%-d/%-m/%Y'))
    end

    it '-1w' do
      response = described_class.call!(%w[Other -1y], 'f' => '%-d/%-m/%Y')
      time = Time.now - 1.year
      expect(response).to eq(time.strftime('%-d/%-m/%Y'))
    end

    it do
      response = described_class.call!(%w[Other -1d], {})
      expect { response.call }.to raise_error
      expect(response).to eq('')
    end
  end
end
