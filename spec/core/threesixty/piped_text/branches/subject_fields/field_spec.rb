# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::PipedText::Branches::SubjectFields::Field do
  describe '.call' do
    let(:project) { create(:project) }
    let(:campaign) { create(:campaign, project: project) }
    let(:threesixty_campaign) { create(:threesixty_campaign, campaign: campaign) }
    let(:subject) { create(:user, first_name: 'Vasiliy', last_name: 'Pupkin', email: 'my@email.com', project: project) }
    let(:evaluator) { create(:user, project: project) }
    let(:relationship) { create(:relationship, name: 'Boss') }

    before do
      create(:threesixty_participant, campaign: threesixty_campaign.campaign, evaluator_id: evaluator.id, subject_id: subject.id, relationship: relationship)
    end

    it do
      response = described_class.call!(%w[Field Name], {}, subject: subject, threesixty_campaign: 'ddd')
      expect(response).to eq('Vasiliy Pupkin')
    end

    it do
      response = described_class.call!(%w[Field Email], {}, subject: subject, threesixty_campaign: 'ddd')
      expect(response).to eq('my@email.com')
    end

    it do
      response = described_class.call!(%w[Field FirstName], {}, subject: subject, threesixty_campaign: 'ddd')
      expect(response).to eq('Vasiliy')
    end

    it do
      response = described_class.call!(%w[Field RelationshipName], {}, subject: subject, evaluator: evaluator, threesixty_campaign: threesixty_campaign)
      expect(response).to eq('Boss')
    end

    it do
      response = described_class.call!(%w[Field RelationshipName], {}, subject: subject, threesixty_campaign: threesixty_campaign)
      expect(response).to eq(nil)
    end

    it do
      response = described_class.call!(%w[Field Oops], {}, subject: subject, threesixty_campaign: 'ddd')
      expect(response).to eq('')
    end
  end
end
