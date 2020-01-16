# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Campaigns::CreateEmptyCampaign do
  let(:project) { create(:project) }
  let(:form) { Threesixty::Campaigns::CreateForm.new(name: 'New campaign') }

  describe '.call' do
    it 'creates a Threesixty::Campaign record' do
      threesixty_campaign = described_class.call!(form, project)

      expect(threesixty_campaign).to be_an_instance_of(Threesixty::Campaign)
      expect(threesixty_campaign).to be_persisted
      expect(threesixty_campaign.name).to eq(form.name)
    end

    it 'creates a Campaign record' do
      threesixty_campaign = described_class.call!(form, project)

      expect(threesixty_campaign.campaign).to be_persisted
    end

    it 'creates a Threesixty::Option record for a Threesixty::Campaign' do
      threesixty_campaign = described_class.call!(form, project)

      expect(threesixty_campaign.option).to be_persisted
    end

    it 'creates assessment' do
      threesixty_campaign = described_class.call!(form, project)

      expect(threesixty_campaign.assessment).to be_persisted
    end

    it 'creates report' do
      threesixty_campaign = described_class.call!(form, project)

      expect(threesixty_campaign.report).to be_persisted
    end

    it 'creates dimension' do
      threesixty_campaign = described_class.call!(form, project)

      expect(threesixty_campaign.assessment.dimension).to be_persisted
    end
  end
end
