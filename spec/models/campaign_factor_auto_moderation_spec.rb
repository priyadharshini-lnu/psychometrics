# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'CampaignFactor#auto_moderated? and scopes', type: :model do
  let(:campaign) { create(:campaign) }

  describe '#auto_moderated?' do
    context 'when factor is assessor_scoring with disallow_lead_assessor_moderation true' do
      let(:campaign_factor) do
        create(:campaign_factor, campaign: campaign, factor_type: :assessor_scoring,
               disallow_lead_assessor_moderation: true)
      end

      it 'returns true' do
        expect(campaign_factor.auto_moderated?).to eq(true)
      end
    end

    context 'when factor is assessor_scoring with disallow_lead_assessor_moderation false' do
      let(:campaign_factor) do
        create(:campaign_factor, campaign: campaign, factor_type: :assessor_scoring,
               disallow_lead_assessor_moderation: false)
      end

      it 'returns false' do
        expect(campaign_factor.auto_moderated?).to eq(false)
      end
    end

    context 'when factor is not assessor_scoring but has disallow_lead_assessor_moderation true' do
      let(:campaign_factor) do
        create(:campaign_factor, campaign: campaign, factor_type: :formula,
               disallow_lead_assessor_moderation: true)
      end

      it 'returns false' do
        expect(campaign_factor.auto_moderated?).to eq(false)
      end
    end
  end

  describe '.auto_moderated scope' do
    let!(:auto_moderated_factor) do
      create(:campaign_factor, campaign: campaign, disallow_lead_assessor_moderation: true)
    end

    let!(:manually_moderated_factor) do
      create(:campaign_factor, campaign: campaign, disallow_lead_assessor_moderation: false)
    end

    it 'returns only factors with disallow_lead_assessor_moderation true' do
      result = CampaignFactor.auto_moderated

      expect(result).to include(auto_moderated_factor)
      expect(result).not_to include(manually_moderated_factor)
    end
  end

  describe '.manually_moderated scope' do
    let!(:auto_moderated_factor) do
      create(:campaign_factor, campaign: campaign, disallow_lead_assessor_moderation: true)
    end

    let!(:manually_moderated_factor) do
      create(:campaign_factor, campaign: campaign, disallow_lead_assessor_moderation: false)
    end

    it 'returns only factors with disallow_lead_assessor_moderation false' do
      result = CampaignFactor.manually_moderated

      expect(result).to include(manually_moderated_factor)
      expect(result).not_to include(auto_moderated_factor)
    end
  end
end
