# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CampaignFactorValue, type: :model do
  describe 'value=' do
    let(:campaign) { create(:campaign) }
    let(:campaign_factor) do
      create(:campaign_factor, campaign: campaign, output_type: :numeric,
              factor_type: :formula, code: 'A', formula: '__B + __C')
    end
    let(:campaign_factor_value) { create(:campaign_factor_value, campaign_factor: campaign_factor, numeric_value: nil) }

    context 'when campaign factor has numeric output type' do
      it 'sets numeric_value and clears string_value when new_value is numeric' do
        campaign_factor_value.value = 42

        expect(campaign_factor_value.numeric_value).to eq(42)
        expect(campaign_factor_value.string_value).to be_nil
      end

      it 'does not set numeric_value when new_value is not numeric' do
        campaign_factor_value.value = 'not a number'

        expect(campaign_factor_value.numeric_value).to be_nil
        expect(campaign_factor_value.string_value).to be_nil
      end
    end

    context 'when campaign factor has string output type' do
      before do
        campaign_factor.update!(output_type: :string)
      end

      it 'sets string_value and clears numeric_value when new_value is a string' do
        campaign_factor_value.value = 'test string'

        expect(campaign_factor_value.string_value).to eq('test string')
        expect(campaign_factor_value.numeric_value).to be_nil
      end

      it 'does not set string_value when new_value is not a string' do
        campaign_factor_value.value = 42

        expect(campaign_factor_value.string_value).to be_nil
        expect(campaign_factor_value.numeric_value).to be_nil
      end
    end
  end
end
