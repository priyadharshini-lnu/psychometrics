# frozen_string_literal: true

require 'rails_helper'

describe Licenses::GetStats do
  let(:campaign) { create(:campaign, name: 'first') }
  let(:user) { create(:user, first_name: 'Vasily', last_name: 'Pupkin', email: 'pup@gmail.com') }

  it 'gets the stats' do
    create(:license, type: :threesixty,
      client: campaign.client, start_date: 10.days.ago, end_date: 15.days.since)

    create(:license_usage, client: campaign.client,
      license: campaign.client.licenses.find_by(type: 'threesixty'),
      user: user, campaign: campaign, created_at: 1.day.ago)

    get_stats = Licenses::GetStats.call!

    expect(get_stats).to be_an_instance_of(Hash)
    expect(get_stats.key?(:expiring_licenses)).to be_truthy
    expect(get_stats[:expiring_licenses][0].key?(:client_name)).to be_truthy
    expect(get_stats[:expiring_licenses][0].key?(:license_end_date)).to be_truthy

    expect(get_stats.key?(:used_licenses)).to be_truthy
    expect(get_stats[:used_licenses][0].key?(:use_count)).to be_truthy
    expect(get_stats[:used_licenses][0].key?(:remaining_count)).to be_truthy
  end
end
