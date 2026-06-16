# frozen_string_literal: true

require 'rails_helper'

describe Workshops::AvailableAssessors do
  let(:campaign) { create(:campaign) }

  it 'shows global assessors who based on the availability' do
    global_assessor = create(:user, role: User::ADMIN_ROLE, global_assessor: true)
    not_global_assessor = create(:user, role: User::ADMIN_ROLE, global_assessor: false)

    [global_assessor, not_global_assessor].each do |admin|
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
      Time.zone.parse('2023-07-11 07:00:00 +0400'), Time.zone.parse('2023-07-11 08:00:00 +0400')
    ).query
    expect(result.length).to eq(1)
    expect(result[0].id).to eq(global_assessor.id)
  end

  it 'excludes application users from assessor selection' do
    application_user = create(:application_user, global_assessor: true)
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
      Time.zone.parse('2023-07-11 07:00:00 +0400'), Time.zone.parse('2023-07-11 08:00:00 +0400')
    ).query
    expect(result.map(&:id)).not_to include(application_user.id)
  end
end
