# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Campaigns::Create do
  let(:project) { create(:project) }
  let(:campaign_params) { { name: 'New campaign' } }
  let(:threesixty_campaign_params) { { factors: [] } }

  describe '.call' do
    it 'creates a Campaign record' do
      campaign = ::Threesixty::Campaigns::Create.call!(project, campaign_params, threesixty_campaign_params)

      expect(campaign).to be_an_instance_of(Campaign)
      expect(campaign).to be_persisted
      expect(campaign.name).to eq(campaign_params[:name])
    end

    it 'creates a Threesixty::Campaign record' do
      campaign = ::Threesixty::Campaigns::Create.call!(project, campaign_params, threesixty_campaign_params)

      expect(campaign.threesixty_campaign).to be_persisted
    end

    it 'creates a Threesixty::Option record for a Threesixty::Campaign' do
      campaign = ::Threesixty::Campaigns::Create.call!(project, campaign_params, threesixty_campaign_params)

      expect(campaign.threesixty_campaign.option).to be_persisted
    end

    it 'calls CreateEmptyCampaign when assessments are not passed' do
      expect(::Threesixty::CreateEmptyCampaign).to receive(:call)

      ::Threesixty::Campaigns::Create.call!(project, campaign_params, threesixty_campaign_params)
    end

    it 'calls CreateFromAssessment when assessments are passed' do
      expect(::Threesixty::CreateFromAssessment).to receive(:call)

      ::Threesixty::Campaigns::Create.call!(project, campaign_params, assessment_id: create(:assessment).id)
    end
  end
end
