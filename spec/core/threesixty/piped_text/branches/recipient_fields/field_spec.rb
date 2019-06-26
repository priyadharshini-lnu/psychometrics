# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::PipedText::Branches::RecipientFields::Field do
  describe '.call' do
    let(:user) { create(:user, first_name: 'Vasiliy', last_name: 'Pupkin', email: 'my@email.com') }

    it do
      response = described_class.call!(%w[Field Name], {}, recipient: user, threesixty_campaign: 'ddd')
      expect(response).to eq('Vasiliy Pupkin')
    end

    it do
      response = described_class.call!(%w[Field Email], {}, recipient: user, threesixty_campaign: 'ddd')
      expect(response).to eq('my@email.com')
    end

    it do
      response = described_class.call!(%w[Field FirstName], {}, recipient: user, threesixty_campaign: 'ddd')
      expect(response).to eq('Vasiliy')
    end

    it do
      response = described_class.call!(%w[Field LastName], {}, recipient: user, threesixty_campaign: 'ddd')
      expect(response).to eq('Pupkin')
    end

    it do
      response = described_class.call!(%w[Field Oops], {}, recipient: user, threesixty_campaign: 'ddd')
      expect(response).to eq('')
    end
  end
end
