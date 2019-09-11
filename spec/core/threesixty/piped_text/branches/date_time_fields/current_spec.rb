# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::PipedText::Branches::DateTimeFields::Current do
  describe '.call' do
    it do
      response = described_class.call!(%w[Current], 'f' => '%-d/%-m/%Y')
      expect(response).to eq(Time.now.strftime('%-d/%-m/%Y'))
    end

    it do
      response = described_class.call!(%w[Current], {})
      expect { response.call }.to raise_error
      expect(response).to eq('')
    end
  end
end
