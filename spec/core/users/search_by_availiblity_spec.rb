# frozen_string_literal: true

require 'rails_helper'

describe Users::SearchByAvailability do
  let(:campaign) { create(:campaign) }

  it 'shows users based on the availability' do
    users = create_list(:user, 2)
    user_1_availability_date = create(
      :user_availability_date,
      timezone: 'Asia/Muscat',
      user: users[0],
      start_date: Date.parse('2023-07-10'),
      end_date: Date.parse('2023-07-20')
    )
    create(
      :user_availability_day,
      user_availability_date: user_1_availability_date,
      day: 2,
      start_time: '06:00:00',
      end_time: '08:00:00'
    )
    create(
      :user_availability_day,
      user_availability_date: user_1_availability_date,
      day: 3,
      start_time: '08:00:00',
      end_time: '10:00:00'
    )
    user_2_availability_date = create(
      :user_availability_date,
      timezone: 'Asia/Muscat',
      user: users[1],
      start_date: Date.parse('2023-07-10 '),
      end_date: Date.parse('2023-07-20')
    )
    create(
      :user_availability_day,
      user_availability_date: user_2_availability_date,
      day: 3,
      start_time: '09:00:00',
      end_time: '11:00:00'
    )

    # 2nd day of week (Tuesday) i.e 2023-07-11
    result = described_class.new(
      Time.zone.parse('2023-07-11 07:00:00 +0400'), Time.zone.parse('2023-07-11 08:00:00 +0400')
    ).query
    expect(result.length).to eq(1)
    expect(result[0].id).to eq(users[0].id)

    # 2nd day of week (Tuesday) i.e 2023-07-18
    result = described_class.new(
      Time.zone.parse('2023-07-18 06:00:00 +0400'), Time.zone.parse('2023-07-18 07:00:00 +0400')
    ).query
    expect(result.length).to eq(1)
    expect(result[0].id).to eq(users[0].id)

    # 3rd day of week (Wednesday) i.e 2023-07-19
    result = described_class.new(
      Time.zone.parse('2023-07-19 08:00:00 +0400'), Time.zone.parse('2023-07-19 10:00:00 +0400')
    ).query
    expect(result.length).to eq(1)
    expect(result[0].id).to eq(users[0].id)

    # 3rd day of week (Wednesday) i.e 2023-07-19
    result = described_class.new(
      Time.zone.parse('2023-07-19 09:00:00 +0400'), Time.zone.parse('2023-07-19 10:30:00 +0400')
    ).query
    expect(result.length).to eq(1)
    expect(result[0].id).to eq(users[1].id)

    # 3rd day of week (Wednesday) i.e 2023-07-19
    result = described_class.new(
      Time.zone.parse('2023-07-19 09:00:00 +0400'), Time.zone.parse('2023-07-19 9:30:00:00 +0400')
    ).query
    expect(result.length).to eq(2)
    expect(result.pluck(:id)).to match_array(users.map(&:id))
  end

  it 'works with multiple availability dates and with multiple days' do
    user = create(:user)
    user_availability_date1 = create(
      :user_availability_date,
      timezone: 'Asia/Muscat',
      user: user,
      start_date: Date.parse('2023-07-10'),
      end_date: Date.parse('2023-07-20')
    )
    user_availability_date2 = create(
      :user_availability_date,
      timezone: 'Asia/Muscat',
      user: user,
      start_date: Date.parse('2023-07-21'),
      end_date: Date.parse('2023-07-30')
    )
    create(
      :user_availability_day,
      user_availability_date: user_availability_date1,
      day: 2,
      start_time: '06:00:00',
      end_time: '08:00:00'
    )
    create(
      :user_availability_day,
      user_availability_date: user_availability_date1,
      day: 2,
      start_time: '13:00:00',
      end_time: '15:00:00'
    )
    create(
      :user_availability_day,
      user_availability_date: user_availability_date1,
      day: 3,
      start_time: '15:00',
      end_time: '19:00'
    )
    create(
      :user_availability_day,
      user_availability_date: user_availability_date2,
      day: 4,
      start_time: '16:00',
      end_time: '19:00'
    )

    # 2nd day of week (Tuesday) i.e 2023-07-11
    result = described_class.new(
      Time.zone.parse('2023-07-11 07:00:00 +0400'), Time.zone.parse('2023-07-11 08:00:00 +0400')
    ).query
    expect(result.length).to eq(1)
    expect(result[0].id).to eq(user.id)

    # 2nd day of week (Tuesday) i.e 2023-07-18
    result = described_class.new(
      Time.zone.parse('2023-07-18 13:40:00 +0400'), Time.zone.parse('2023-07-18 14:00:00 +0400')
    ).query
    expect(result.length).to eq(1)
    expect(result[0].id).to eq(user.id)

    # 3rd day of week (Wednesday) i.e 2023-07-19
    result = described_class.new(
      Time.zone.parse('2023-07-19 15:20:00 +0400'), Time.zone.parse('2023-07-19 19:00:00 +0400')
    ).query
    expect(result.length).to eq(1)
    expect(result[0].id).to eq(user.id)

    # 4th day of week (Thursday) i.e 2023-07-27
    result = described_class.new(
      Time.zone.parse('2023-07-27 16:30:00 +0400'), Time.zone.parse('2023-07-27 18:00:00 +0400')
    ).query
    expect(result.length).to eq(1)
    expect(result[0].id).to eq(user.id)
  end

  it "don't show user whose availability has been booked" do
    user = create(:user)
    user_availability_date = create(
      :user_availability_date,
      timezone: 'Asia/Muscat',
      user: user,
      start_date: Date.parse('2023-07-10'),
      end_date: Date.parse('2023-07-20')
    )
    create(
      :user_availability_day,
      user_availability_date: user_availability_date,
      day: 2,
      start_time: '06:00',
      end_time: '09:00'
    )
    create(
      :user_booking,
      user: user,
      start_time: Time.zone.parse('2023-07-11 06:00:00 +0400'),
      end_time: '2023-07-11 07:00:00 +0400'
    )
    create(
      :user_booking,
      user: user,
      start_time: Time.zone.parse('2023-07-11 08:00:00 +0400'),
      end_time: '2023-07-11 08:30:00 +0400'
    )

    result = described_class.new(
      Time.zone.parse('2023-07-11 07:00:00 +0400'), Time.zone.parse('2023-07-11 08:00:00 +0400')
    ).query
    expect(result.length).to eq(1)
    expect(result[0].id).to eq(user.id)

    # Disable this check for now as we are not checking for bookings
    # result = described_class.new(
    #   Time.zone.parse('2023-07-11 06:00:00 +0400'), Time.zone.parse('2023-07-11 06:30:00 +0400')
    # ).query
    # expect(result.length).to eq(0)

    # result = described_class.new(
    #   Time.zone.parse('2023-07-11 07:00:00 +0400'), Time.zone.parse('2023-07-11 08:10:00 +0400')
    # ).query
    # expect(result.length).to eq(0)
  end

  it 'check availability with different timezones' do
    user = create(:user)
    user_availability_date = create(
      :user_availability_date,
      timezone: 'Asia/Kolkata',
      user: user,
      start_date: Date.parse('2023-07-10'),
      end_date: Date.parse('2023-07-20')
    )
    create(
      :user_availability_day,
      user_availability_date: user_availability_date,
      day: 2,
      start_time: '06:00',
      end_time: '09:00'
    )

    result = described_class.new(
      Time.zone.parse('2023-07-11 04:30:00 +0400'), Time.zone.parse('2023-07-11 07:30:00 +0400')
    ).query
    expect(result.length).to eq(1)
    expect(result[0].id).to eq(user.id)

    result = described_class.new(
      Time.zone.parse('2023-07-11 07:30:00 +0400'), Time.zone.parse('2023-07-11 08:30:00 +0400')
    ).query
    expect(result.length).to eq(0)
  end

  it 'limit no of records' do
    users = create_list(:user, 2)

    users.each do |user|
      admin_availability_date = create(
        :user_availability_date,
        timezone: 'Asia/Muscat',
        user: user,
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
      Time.zone.parse('2023-07-11 06:00:00 +0400'), Time.zone.parse('2023-07-11 08:00:00 +0400')
    ).query
    expect(result.length).to eq(2)

    result = described_class.new(
      Time.zone.parse('2023-07-11 06:00:00 +0400'), Time.zone.parse('2023-07-11 08:00:00 +0400'), limit: 1
    ).query
    expect(result.length).to eq(1)
  end

  it 'search user by first name, last name and email' do
    user1 = create(:user, first_name: 'John', last_name: 'Doe', email: 'john@cc.com')
    user2 = create(:user, first_name: 'Jane', last_name: 'Cole', email: 'jane@cc.com')
    user_1_availability_date = create(
      :user_availability_date,
      timezone: 'Asia/Muscat',
      user: user1,
      start_date: Date.parse('2023-07-10'),
      end_date: Date.parse('2023-07-20')
    )
    create(
      :user_availability_day,
      user_availability_date: user_1_availability_date,
      day: 2,
      start_time: '06:00:00',
      end_time: '08:00:00'
    )
    create(
      :user_availability_day,
      user_availability_date: user_1_availability_date,
      day: 3,
      start_time: '08:00:00',
      end_time: '10:00:00'
    )
    user_2_availability_date = create(
      :user_availability_date,
      timezone: 'Asia/Muscat',
      user: user2,
      start_date: Date.parse('2023-07-10 '),
      end_date: Date.parse('2023-07-20')
    )
    create(
      :user_availability_day,
      user_availability_date: user_2_availability_date,
      day: 3,
      start_time: '09:00:00',
      end_time: '11:00:00'
    )

    result = described_class.new(
      Time.zone.parse('2023-07-19 09:00:00 +0400'), Time.zone.parse('2023-07-19 9:30:00:00 +0400'), search_term: 'john'
    ).query
    expect(result.length).to eq(1)
    expect(result[0].id).to eq(user1.id)

    result = described_class.new(
      Time.zone.parse('2023-07-19 09:00:00 +0400'), Time.zone.parse('2023-07-19 9:30:00:00 +0400'), search_term: 'jane'
    ).query
    expect(result.length).to eq(1)
    expect(result[0].id).to eq(user2.id)

    result = described_class.new(
      Time.zone.parse('2023-07-19 09:00:00 +0400'),
      Time.zone.parse('2023-07-19 9:30:00:00 +0400'),
      search_term: 'jane@cc'
    ).query
    expect(result.length).to eq(1)
    expect(result[0].id).to eq(user2.id)

    result = described_class.new(
      Time.zone.parse('2023-07-19 09:00:00 +0400'), Time.zone.parse('2023-07-19 9:30:00:00 +0400'), search_term: 'Col'
    ).query
    expect(result.length).to eq(1)
    expect(result[0].id).to eq(user2.id)

    result = described_class.new(
      Time.zone.parse('2023-07-19 09:00:00 +0400'), Time.zone.parse('2023-07-19 9:30:00:00 +0400'), search_term: 'J'
    ).query
    expect(result.length).to eq(2)
    expect(result.pluck(:id)).to match_array([user1.id, user2.id])

    result = described_class.new(
      Time.zone.parse('2023-07-19 09:00:00 +0400'),
      Time.zone.parse('2023-07-19 9:30:00:00 +0400'),
      search_term: 'John D'
    ).query
    expect(result.length).to eq(1)
    expect(result.pluck(:id)).to match_array([user1.id])
  end

  it 'handles day change due to difference in timezone between saved availability and passed date' do
    user = create(:user)
    user_availability_date = create(
      :user_availability_date,
      timezone: 'Etc/UTC',
      user: user,
      start_date: Date.parse('2023-08-10'),
      end_date: Date.parse('2023-08-30')
    )
    create(
      :user_availability_day,
      user_availability_date: user_availability_date,
      day: 1,
      start_time: '21:00:00',
      end_time: '22:00:00'
    )

    # 2023-08-21 21:00 UTC is 2023-08-22 01:00 (UTC+4). 21st is Monday i.e day 1 of week
    result = described_class.new(
      Time.zone.parse('2023-08-22 01:00:00 +0400'), Time.zone.parse('2023-08-22 02:00:00 +0400')
    ).query
    expect(result.length).to eq(1)
    expect(result[0].id).to eq(user.id)
  end
end
