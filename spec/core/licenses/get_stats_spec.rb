# frozen_string_literal: true

require 'rails_helper'

describe Licenses::GetStats do
  let(:client_one) { create(:tenancy, without_license: false, name: 'ClientOne') }
  let(:client_two) { create(:tenancy, without_license: false, name: 'ClientTwo') }

  let(:campaign) { create(:campaign, name: 'first') }
  let(:user) { create(:user, first_name: 'Vasily', last_name: 'Pupkin', email: 'pup@gmail.com') }

  it 'gets the stats' do
    create(:license, type: :threesixty,
      client: client_one, start_date: 10.days.ago, end_date: 15.days.since)

    create(:license_usage, client: client_one,
      license: client_one.licenses.find_by(type: 'threesixty'),
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

  it 'gets stats of expiring licences withing 30 days' do
    create(:license, type: :threesixty,
      client: client_one, start_date: 2.months.ago, end_date: 30.days.ago)
    create(:license, type: :threesixty,
      client: client_two, start_date: 2.months.ago, end_date: 15.days.since)

    get_stats = Licenses::GetStats.call!
    expect(get_stats[:expiring_licenses][0][:client_name]).not_to eql(client_one.name)
    expect(get_stats[:expiring_licenses][0][:account_manager]).to eql(
      User.find(client_two.account_manager_id).decorate.display_name
    )
  end

  it 'gets stats of license usage for a week' do
    create(:license, type: :threesixty, number: 5,
      client: client_one, start_date: 10.days.ago, end_date: 2.months.since)

    create(:license_usage, client: client_one,
      license: client_one.licenses.find_by(type: 'threesixty'),
      user: user, campaign: campaign, created_at: 1.day.ago)

    create(:license_usage, client: client_one,
      license: client_one.licenses.find_by(type: 'threesixty'),
      user: user, campaign: campaign, created_at: 8.days.ago)

    create(:license_usage, client: client_one,
      license: client_one.licenses.find_by(type: 'threesixty'),
      user: user, campaign: campaign, created_at: 21.days.ago)

    get_stats = Licenses::GetStats.call!
    expect(get_stats[:used_licenses][0][:use_count]).to eq(1) # License used 1.day.ago
    expect(get_stats[:used_licenses][0][:remaining_count]).to eq(2) # Remaining licenses
  end
end
