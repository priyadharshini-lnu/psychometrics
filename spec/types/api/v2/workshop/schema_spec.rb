# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Workshop::Schema do
  let(:valid_params) do
    jsonapi_resource_request(
      'workshops',
      {
        workshops: [
          {
            name: 'name',
            timezone: 'Pacific/Midway',
            duration: 3600,
            cancellation_lead_time: 3600,
            scheduling_lead_time: 3600,
            video_call_type: 0,
            start_time: 'Wed Jul 05 2023 00:07:43 GMT+0530',
            allow_late_cancellation_and_rescheduling: true,
            workshop_resources: [
              {
                name: 'name',
                url: 'www.abc.com'
              }
            ]
          }
        ]
      }
    )
  end

  it 'validates the params successfully' do
    schema = Api::V2::Workshop::Schema.create_all_request.call(valid_params)
    expect(schema.success?).to be(true)
  end

  it 'returns errors for invalid params' do
    schema = Api::V2::Workshop::Schema.create_all_request.call(
      jsonapi_merge_attributes(
        valid_params,
        {
          workshops: [{
            name: '',
            duration: '',
            timezone: '',
            cancellation_lead_time: '',
            scheduling_lead_time: '',
            video_call_type: '',
            start_time: '',
            center_manager_ids: [],
            workshop_resources: [
              {
                name: '',
                url: ''
              }
            ]
          }]
        }
      )
    )

    expect(schema.success?).to be(false)
    expect(schema).to have_jsonapi_attr_error(
      {
        workshops: {
          0 => {
            name: ["can't be blank"],
            duration: ['must be an integer'],
            timezone: ["can't be blank"],
            cancellation_lead_time: ['must be an integer'],
            scheduling_lead_time: ['must be an integer'],
            video_call_type: ["can't be blank"],
            workshop_resources: {
              0 => {
                name: ["can't be blank"],
                url: ["can't be blank"]
              }
            },
            start_time: ["can't be blank"]
          }
        }
      }
    )
  end
end
