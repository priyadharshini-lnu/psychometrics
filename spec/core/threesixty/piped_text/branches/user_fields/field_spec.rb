# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::PipedText::Branches::UserFields::Field do
  describe '.call' do
    let(:project) { create(:project) }
    let(:campaign) { create(:campaign, project: project) }
    let(:threesixty_campaign) { create(:threesixty_campaign, campaign: campaign) }
    let(:user) { create(:user, first_name: 'Vasiliy', last_name: 'Pupkin', email: 'my@email.com', project: project) }

    it do
      response = described_class.call!(%w[Field Name], {}, subject: subject, threesixty_campaign: 'ddd', user: user)
      expect(response).to eq('Vasiliy Pupkin')
    end

    it do
      response = described_class.call!(%w[Field Email], {}, subject: subject, threesixty_campaign: 'ddd', user: user)
      expect(response).to eq('my@email.com')
    end

    it do
      response = described_class.call!(%w[Field FirstName], {}, subject: subject, threesixty_campaign: 'ddd', user: user)
      expect(response).to eq('Vasiliy')
    end

    it do
      response = described_class.call!(%w[Field Oops], {}, subject: subject, threesixty_campaign: 'ddd', user: user)
      expect(response).to eq('')
    end
  end
end
