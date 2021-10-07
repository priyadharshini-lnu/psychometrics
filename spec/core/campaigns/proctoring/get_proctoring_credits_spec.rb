# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Proctoring::GetProctoringCredits do
  let(:campaign_options) { create(:campaign_option, fixed_time_duration: 3600) }
  let(:campaign) { create(:campaign, campaign_options: campaign_options) }

  it 'returns right credits count' do
    result = described_class.call!(campaign)
    expect(result).to eq(6)
  end

  it 'returns right credits count' do
    campaign_options.fixed_time_duration = 1680
    result = described_class.call!(campaign)
    expect(result).to eq(4)
  end

  it 'returns right credits count' do
    campaign_options.fixed_time_duration = 1800
    result = described_class.call!(campaign)
    expect(result).to eq(4)
  end

  it 'returns right credits count' do
    campaign_options.fixed_time_duration = 1860
    result = described_class.call!(campaign)
    expect(result).to eq(5)
  end

  it 'returns right credits count' do
    campaign_options.fixed_time_duration = 7200
    result = described_class.call!(campaign)
    expect(result).to eq(10)
  end
  it 'returns right credits count' do
    campaign_options.fixed_time_duration = 7260
    result = described_class.call!(campaign)
    expect(result).to eq(11)
  end
end
