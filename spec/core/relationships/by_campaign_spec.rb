# frozen_string_literal: true

require 'rails_helper'

describe Relationships::ByCampaign do
  describe '#query' do
    let(:campaign) { create(:campaign) }
    let(:another_campaign) { create(:campaign) }

    before do
      create(:relationship, name: 'manager', type: :global)
      create(:relationship, name: 'peer', type: :campaign, campaign: campaign)
      create(:relationship, name: 'self', type: :campaign, campaign: another_campaign)
    end

    it do
      relationships = described_class.new(campaign).to_a
      expect(relationships.map(&:name)).to match_array %w[manager peer]
    end
  end
end
