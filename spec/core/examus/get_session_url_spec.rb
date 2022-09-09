# frozen_string_literal: true

require 'rails_helper'

describe Examus::GetSessionUrl do
  let(:campaign) { create(:campaign) }
  let(:campaign_user) do
    create(:campaign_user, started_at: Time.zone.now, campaign: campaign, expiry_date: 10.minutes.from_now)
  end

  it 'returns examus session url' do
    token = 'token'
    allow(Examus::JwtTokenizer).to receive(:encode).
      with(hash_including(duration: 10)).and_return(token)
    expected_url = "https://examus.net/integration/simple/test/start/?token=#{token}"
    actual_url = described_class.call!(campaign_user)
    expect(actual_url).to eq(expected_url)
  end
end
