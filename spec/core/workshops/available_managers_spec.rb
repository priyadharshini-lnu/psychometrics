# frozen_string_literal: true

require 'rails_helper'

describe Workshops::AvailableManagers do
  let(:campaign) { create(:campaign) }

  it 'shows admins who have access to campaign based on the availability' do
    admins = create_list(:user, 2, role: User::ADMIN_ROLE)
    create(:membership, user: admins[0], campaign: campaign, role: Membership::CAMPAIGN_ADMIN_ROLE)

    admins.each do |admin|
      admin_availability_date = create(
        :user_availability_date,
        timezone: 'Asia/Muscat',
        user: admin,
        start_date: Date.parse('2023-07-10'),
        end_date: Date.parse('2023-07-20')
      )
      create(
        :user_availability_day,
        user_availability_date: admin_availability_date,
        day: 2,
        start_time: '06:00:00',
        end_time: '08:00:00'
      )
    end

    result = described_class.new(
      Time.zone.parse('2023-07-11 07:00:00 +0400'), Time.zone.parse('2023-07-11 08:00:00 +0400'), campaign.id
    ).query
    expect(result.length).to eq(1)
    expect(result[0].id).to eq(admins[0].id)
  end

  it 'excludes application users from center manager selection' do
    application_user = create(:application_user)
    create(:membership, user: application_user, campaign: campaign, role: Membership::CAMPAIGN_ADMIN_ROLE)
    availability_date = create(
      :user_availability_date,
      timezone: 'Asia/Muscat',
      user: application_user,
      start_date: Date.parse('2023-07-10'),
      end_date: Date.parse('2023-07-20')
    )
    create(
      :user_availability_day,
      user_availability_date: availability_date,
      day: 2,
      start_time: '06:00:00',
      end_time: '08:00:00'
    )

    result = described_class.new(
      Time.zone.parse('2023-07-11 07:00:00 +0400'), Time.zone.parse('2023-07-11 08:00:00 +0400'), campaign.id
    ).query
    expect(result.map(&:id)).not_to include(application_user.id)
  end
end
