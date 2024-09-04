# frozen_string_literal: true

require 'rails_helper'

describe CampaignUsers::GetCampaignScore do
  let!(:campaign) { create(:campaign) }
  let!(:user) { create(:user) }
  let!(:campaign_factor) { create(:campaign_factor, code: 'code', campaign: campaign) }
  let!(:campaign_factor2) { create(:campaign_factor, code: 'code2', campaign: campaign) }
  let!(:campaign_factor_value) do
    create(:campaign_factor_value, campaign_factor: campaign_factor,
                                        campaign: campaign, user: user, value: 2.3)
  end
  let!(:campaign_factor_value2) do
    create(:campaign_factor_value, campaign_factor: campaign_factor2,
                                        campaign: campaign, user: user, value: 4)
  end

  it 'returns the campaign factor scores for specific code' do
    score = described_class.call!(campaign, user, ['code'])

    expect(score).to eq({ campaign_factor => 2.3 })
  end

  it 'returns all campaign factor scores' do
    score = described_class.call!(campaign, user)

    expect(score).to eq({ campaign_factor => 2.3, campaign_factor2 => 4 })
  end
end
