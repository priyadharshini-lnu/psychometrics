# frozen_string_literal: true

require 'rails_helper'

describe Examus::GetSessionUrl do
  let(:campaign) do
    campaign = create(:campaign)
    campaign.campaign_options.update(fixed_time: true, fixed_time_duration: 10.minutes.to_i)
    campaign
  end
  let(:campaign_user) do
    create(:campaign_user, started_at: Time.zone.now, campaign: campaign, expiry_date: 10.minutes.from_now,
status: :in_progress)
  end
  let!(:proctoring_license) do
    create(:proctoring_license, client: campaign.client)
  end

  it 'returns examus session url' do
    token = 'token'
    allow(Examus::JwtTokenizer).to receive(:encode).
      with(hash_including(duration: 10)).and_return(token)
    expect(Campaigns::Proctoring::GetProctoringCredits).to receive(:call!).at_least(:once).and_return(30)
    expected_url = "https://examus.net/integration/simple/test/start/?token=#{token}"
    actual_url = described_class.call!(campaign_user: campaign_user, locale: 'en')
    expect(actual_url).to eq(expected_url)
  end
end
