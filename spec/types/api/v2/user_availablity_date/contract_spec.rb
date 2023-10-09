# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::UserAvailabilityDate::Contract do
  let(:user) { create(:user) }
  let(:valid_params) do
    jsonapi_resource_request(
      'user_availability_dates',
      { id: '100', start_date: '2023-10-20', end_date: '2032-10-30', timezone: 'Asia/Muscat',
        availability_days: [{ day: 1, start_time: '10:00', end_time: '12:00' }] }
    )
  end

  it 'validates timezone' do
    params = jsonapi_merge_attributes(valid_params, { timezone: 'invalid_timezone' })
    contract = Api::V2::UserAvailabilityDate::Contract.new.call(params, { current_user: user })

    expect(contract.failure?).to eq(true)
    expect(contract).to have_jsonapi_attr_error(
      timezone: ['invalid value passed']
    )
  end

  it 'validates if it overlaps with existing availability dates' do
    create(:user_availability_date, user: user, start_date: '2023-10-20', end_date: '2023-10-30')
    params = jsonapi_merge_attributes(valid_params, { start_date: '2023-10-20', end_date: '2023-10-25' })
    contract = Api::V2::UserAvailabilityDate::Contract.new.call(params, { current_user: user })

    expect(contract.failure?).to eq(true)
    expect(contract).to have_jsonapi_attr_error(
      start_date: ['Overlaps another availability (20th October 2023 - 30th October 2023)']
    )
  end

  it 'validates if start_date is less then end_date' do
    params = jsonapi_merge_attributes(valid_params, { start_date: '2023-10-20', end_date: '2023-10-01' })
    contract = Api::V2::UserAvailabilityDate::Contract.new.call(params, { current_user: user })

    expect(contract.failure?).to eq(true)
    expect(contract).to have_jsonapi_attr_error(
      start_date: ['Start date should be less than end date']
    )
  end

  it 'validates if start_time is less then end_time' do
    params = jsonapi_merge_attributes(
      valid_params,
      availability_days: [
        { day: 1, start_time: '10:00', end_time: '09:00' },
        { day: 1, start_time: '12:00', end_time: '13:00' },
        { day: 1, start_time: '16:00', end_time: '14:00' }
      ]
    )
    contract = Api::V2::UserAvailabilityDate::Contract.new.call(params, { current_user: user })

    expect(contract.failure?).to eq(true)
    expect(contract).to have_jsonapi_attr_error(
      availability_days: {
        0 => ['Start time should be less than end time'], 2 => ['Start time should be less than end time']
      }
    )
  end

  it 'validates overlapping time interval' do
    params = jsonapi_merge_attributes(
      valid_params,
      availability_days: [
        { day: 1, start_time: '05:00', end_time: '08:00' },
        { day: 1, start_time: '07:00', end_time: '09:00' },
        { day: 1, start_time: '16:00', end_time: '18:00' }
      ]
    )
    contract = Api::V2::UserAvailabilityDate::Contract.new.call(params, { current_user: user })

    expect(contract.failure?).to eq(true)
    expect(contract).to have_jsonapi_attr_error(
      availability_days: {
        0 => ['Overlaps interval 07:00 AM - 09:00 AM'], 1 => ['Overlaps interval 05:00 AM - 08:00 AM']
      }
    )
  end

  it 'passes if all params are valid' do
    contract = Api::V2::UserAvailabilityDate::Contract.new.call(valid_params, { current_user: user })

    expect(contract.failure?).to eq(false)
  end
end
