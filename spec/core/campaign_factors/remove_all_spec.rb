# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CampaignFactors::RemoveAll do
  describe '#call' do
    let(:campaign) { create(:campaign) }
    let(:campaign_factor_group) { create(:campaign_factor_group, campaign: campaign) }

    let!(:campaign_factor1) do
      create(:campaign_factor, campaign: campaign, campaign_factor_group: campaign_factor_group)
    end

    let!(:manual_campaign_factor_value) do
      create(:campaign_factor_value, campaign_factor: campaign_factor1, calculation_type: 'manual')
    end

    let!(:campaign_factor2) do
      create(:campaign_factor, campaign: campaign, campaign_factor_group: campaign_factor_group).tap do |factor|
        create(:campaign_factor_value, campaign_factor: factor, calculation_type: 'auto')
      end
    end

    let!(:empty_campaign_factor_group) { create(:campaign_factor_group, campaign: campaign) }

    subject(:remove_all_campaign_factors) { described_class.new(campaign).call }

    it 'deletes campaign factors without manual scores' do
      expect { remove_all_campaign_factors }.to change { campaign.campaign_factors.count }.by(-1)
      expect(campaign.campaign_factors).to include(campaign_factor1)
      expect(campaign.campaign_factors).not_to include(campaign_factor2)
    end

    it 'deletes empty campaign factor groups' do
      manual_campaign_factor_value.update!(calculation_type: :auto)
      expect { remove_all_campaign_factors }.to change { campaign.campaign_factor_groups.count }.by(-2)
      expect(campaign.campaign_factor_groups).not_to include(empty_campaign_factor_group)
    end

    it 'broadcasts :ok on success' do
      expect { remove_all_campaign_factors }.to broadcast(:ok, campaign)
    end
  end
end
