# frozen_string_literal: true

require 'rails_helper'

describe Licenses::Use do
  let(:campaign) { create(:campaign) }
  let(:client) { campaign.client }
  let(:user) { create(:user) }
  let(:report) { create(:report) }

  it 'use license when enough licenses are present' do
    license = create(:license, client: client, start_date: 2.days.ago, end_date: 2.days.since, number: 2)
    allow_any_instance_of(Licenses::FetchQuery).to receive(:query).and_return([license])

    license_usage = described_class.call!(campaign, user, report)

    expect(license_usage.license_id).to eq(license.id)
    expect(license_usage.user_id).to eq(user.id)
    expect(license_usage.client_id).to eq(campaign.client.id)
  end

  it 'returns error when there are no licenses present' do
    allow_any_instance_of(Licenses::FetchQuery).to receive(:query).and_return([])

    expect { described_class.call(campaign, user, report) }.to raise_error(
      Licenses::NotEnoughError, "'#{client.name}' does not have enough licenses for '#{report.name}'"
    )
  end

  it 'returns error if license is present but they are expired' do
    expired_license = create(:license, client: client, start_date: 3.days.ago, end_date: 2.days.ago, number: 2)
    allow_any_instance_of(Licenses::FetchQuery).to receive(:query).and_return([expired_license])

    expect { described_class.call(campaign, user, report) }.to raise_error(
      Licenses::NotEnoughError, "'#{client.name}' does not have enough licenses for '#{report.name}'"
    )
  end
end
