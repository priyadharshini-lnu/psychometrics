# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Campaigns::CreateEmptyCampaign do
  subject(:threesixty_campaign) { described_class.call!(form, project, user, resource_name: campaign_name) }

  let!(:campaign_name) { Faker::Name.name }
  let(:project) { create(:project) }
  let(:form) { Threesixty::Campaigns::CreateForm.new(name: campaign_name) }
  let(:user) { create(:user) }

  before { threesixty_campaign }

  describe '.call' do
    it 'creates a Threesixty::Campaign record' do
      expect(threesixty_campaign).to be_an_instance_of(Threesixty::Campaign)
      expect(threesixty_campaign).to be_persisted
      expect(threesixty_campaign.name).to eq(campaign_name)
      expect(threesixty_campaign.assessment.name).to eq(campaign_name)
      expect(threesixty_campaign.report.name).to eq(campaign_name)
    end

    it 'creates a Campaign record' do
      expect(threesixty_campaign.campaign).to be_persisted
    end

    it 'creates a Threesixty::Option record for a Threesixty::Campaign' do
      expect(threesixty_campaign.option).to be_persisted
    end

    it 'creates assessment' do
      expect(threesixty_campaign.assessment).to be_persisted
    end

    it 'creates report' do
      expect(threesixty_campaign.report).to be_persisted
    end

    it 'creates internal report' do
      expect(threesixty_campaign.report.provider).to eq('internal')
    end

    it 'creates dimension' do
      expect(threesixty_campaign.assessment.dimension).to be_persisted
    end

    context 'when threesixty_category is skills_rater' do
      let(:form) { Threesixty::Campaigns::CreateForm.new(name: campaign_name, threesixty_category: 'skills_rater') }

      it 'creates a skills_rater dimension' do
        expect(threesixty_campaign.assessment.dimension).to be_persisted
        expect(threesixty_campaign.assessment.dimension.dimension_type).to eq('skills_rater')
      end
    end
  end
end
