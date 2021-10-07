# frozen_string_literal: true

require 'rails_helper'

describe Examus::RecalculateCredits do
  let(:campaign_options) { create(:campaign_option, fixed_time_duration: 3600) }
  let(:campaign) { create(:campaign, campaign_options: campaign_options) }
  let(:campaign_user) { create(:campaign_user, campaign: campaign) }
  let(:license) { create(:proctoring_license, number: 20, used_number: 6) }
  let(:license_usage) { create(:license_usage, license: license, campaign: campaign, proctoring_credits_debited: 6) }
  let(:proctoring_session) do
    create(
      :proctoring_session,
      completed_at: '2020-10-15 16:32:40',
      campaign_user: campaign_user,
      license_usage: license_usage
    )
  end

  it 'should return unused credits' do
    expect(Campaigns::Proctoring::GetProctoringCredits.call!(campaign)).to eq(6)
    expect(license.used_number).to eq(6)
    described_class.call!(proctoring_session)
    expect(license_usage.proctoring_credits_credited).to eq(5)
    expect(license_usage.proctoring_session_duration).to eq(2160)
    expect(license.reload.used_number).to eq(5)
  end

  it 'should return unused credits' do
    expect(Campaigns::Proctoring::GetProctoringCredits.call!(campaign)).to eq(6)
    expect(license.used_number).to eq(6)
    proctoring_session.completed_at = '2020-10-15 16:25:40'
    described_class.call!(proctoring_session)
    expect(license_usage.proctoring_credits_credited).to eq(4)
    expect(license_usage.proctoring_session_duration).to eq(1740)
    expect(license.reload.used_number).to eq(4)
  end
end
