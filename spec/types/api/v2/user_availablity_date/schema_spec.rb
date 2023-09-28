# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::UserAvailabilityDate::Schema do
  let(:valid_params) do
    jsonapi_resource_request(
      'user_availability_dates',
      { id: '100', start_date: '2023-10-20', end_date: '2032-10-30', timezone: 'Asia/Muscat',
        availability_days: [{ day: 1, start_time: '10:00', end_time: '12:00' }] }
    )
  end

  shared_examples 'common_schema' do |schema|
    it 'validates format of start_date and end_date' do
      schema_obj = schema.call(
        jsonapi_merge_attributes(valid_params, { start_date: '20/10/2020', end_date: '30-10-2020' })
      )

      expect(schema_obj).to have_jsonapi_attr_error(
        start_date: ['is in invalid format'],
        end_date: ['is in invalid format']
      )
    end

    it 'validates format of start_time and end_time' do
      schema_obj = schema.call(
        jsonapi_merge_attributes(
          valid_params,
          { availability_days: [{ day: 1, start_time: '10:30AM', end_time: '12:30 PM' }] }
        )
      )

      expect(schema_obj).to have_jsonapi_attr_error(
        availability_days: { 0 => { start_time: ['is in invalid format'], end_time: ['is in invalid format'] } }
      )
    end

    it 'validates day is in range of 0 to 6' do
      schema_obj = schema.call(
        jsonapi_merge_attributes(
          valid_params,
          { availability_days: [{ day: 7, start_time: '10:30', end_time: '12:30' }] }
        )
      )

      expect(schema_obj).to have_jsonapi_attr_error(
        availability_days: { 0 => { day: ['must be one of: 0, 1, 2, 3, 4, 5, 6'] } }
      )
    end

    it 'passes validation if all params are valid' do
      schema_obj = schema.call(valid_params)

      expect(schema_obj).to be_success
    end
  end

  describe 'create_request' do
    let(:create_schema) { Api::V2::UserAvailabilityDate::Schema.create_request }

    include_examples 'common_schema', Api::V2::UserAvailabilityDate::Schema.create_request

    it 'validates presence of start_date, end_date and timezone' do
      schema_obj = create_schema.call(
        jsonapi_remove_attributes(valid_params, %i[start_date end_date timezone])
      )

      expect(schema_obj).to have_jsonapi_attr_error(
        start_date: ["can't be blank"],
        end_date: ["can't be blank"],
        timezone: ["can't be blank"]
      )
    end
  end

  describe 'update_request' do
    include_examples 'common_schema', Api::V2::UserAvailabilityDate::Schema.update_request
  end
end
