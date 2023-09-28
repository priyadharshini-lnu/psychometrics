# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Webhook::Schema do
  let(:valid_params) do
    jsonapi_resource_request(
      'webhooks',
      {
        id: '1',
        description: 'webhook description',
        url: 'http://www.dummy.com',
        topics: ['assessment_started'],
        username: 'Jon'
      },
      {}
    )
  end

  shared_examples 'create/update' do |method|
    it 'validate presence of attributes' do
      schema = Api::V2::Webhook::Schema.send(method).call(
        jsonapi_merge_attributes(
          valid_params,
          { description: '', url: '', auth_type: '', active: '' }
        )
      )

      expect(schema).to have_jsonapi_attr_error({
        description: ["can't be blank"],
        url: ["can't be blank"],
        auth_type: ["can't be blank"],
        active: ['must be boolean']
      })
    end
  end

  describe 'create' do
    include_examples 'create/update', 'create_request'
  end

  describe 'update' do
    include_examples 'create/update', 'update_request'

    it 'is valid even if some attributes are missing' do
      params_without_name = jsonapi_remove_attributes(valid_params, :username)
      schema = Api::V2::Webhook::Schema.update_request.call(params_without_name)

      expect(schema.failure?).to eq(false)
    end
  end
end
