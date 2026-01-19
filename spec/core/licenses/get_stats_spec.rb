# frozen_string_literal: true

require 'rails_helper'

describe Licenses::GetStats do
  let(:client_one) { create(:tenancy, with_license: false, name: 'ClientOne') }
  let(:client_two) { create(:tenancy, with_license: false, name: 'ClientTwo') }

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
    get_stats.except!(:used_licenses)
    expected_stats = {
      expiring_licenses: [
        {
          client_name: 'ClientTwo',
          license_end_date: 15.days.since.to_date,
          project_manager: 'super admin'
        }
      ]
    }
    expect(get_stats).to eql(expected_stats)
  end

  it 'gets stats of license usage for a week' do
    license = create(:license, type: :threesixty, number: 5,
      client: client_one, start_date: 10.days.ago, end_date: 2.months.since)

    create(:license_usage, client: client_one,
      license: license,
      user: user, campaign: campaign, created_at: 1.day.ago)
    license.increment!(:used_number)

    create(:license_usage, client: client_one,
      license: license,
      user: user, campaign: campaign, created_at: 8.days.ago)
    license.increment!(:used_number)

    create(:license_usage, client: client_one,
      license: license,
      user: user, campaign: campaign, created_at: 21.days.ago)
    license.increment!(:used_number)

    get_stats = Licenses::GetStats.call!
    get_stats.except!(:expiring_licenses)
    expected_stats = {
      used_licenses: [
        {
          client_name: 'ClientOne',
          license_end_date: 2.months.since.to_date,
          type: 'threesixty',
          use_count: 1,
          overuse_limit: 0,
          remaining_count: 2
        }
      ]
    }
    expect(get_stats).to eq(expected_stats)
  end
end
