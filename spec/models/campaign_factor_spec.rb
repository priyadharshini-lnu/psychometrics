# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CampaignFactor, type: :model do
  describe 'validate_cyclic_path!' do
    let(:campaign) { create(:campaign) }

    it 'returns error if there is a cyclic path' do
      create(:campaign_factor, campaign: campaign, factor_type: :formula, code: 'A', formula: '__B + __C')
      create(:campaign_factor, campaign: campaign, factor_type: :formula, code: 'B', formula: '__D + __E')
      campaign_factor = build(
        :campaign_factor, campaign: campaign, factor_type: :formula, code: 'E', formula: '__A + __B'
      )
      campaign_factor.save

      expect(campaign_factor.errors[:formula]).to include(
        'There is a cyclic dependency in the formula. Dependency: A -> B -> E -> A'
      )
    end

    it 'returns no error if there is no cyclic path' do
      create(:campaign_factor, campaign: campaign, factor_type: :formula, code: 'A', formula: '__B + __C')
      campaign_factor = create(
        :campaign_factor, campaign: campaign, factor_type: :formula, code: 'B', formula: '__D + __E'
      )
      campaign_factor.save

      expect(campaign_factor.persisted?).to eq(true)
    end
  end
end
