# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Projects::Schema do
  let(:valid_params) do
    jsonapi_resource_request(
      'projects',
      {
        id: '1',
        name: 'Project Name',
        subdomain: 'project-subdomain',
        number: '123',
        client_id: '1004'
      },
      {}
    )
  end

  shared_examples 'create/update' do |method|
    it 'validate presence of attributes' do
      schema = Api::V2::Projects::Schema.send(method).call(
        jsonapi_merge_attributes(
          valid_params,
          { name: '', subdomain: '', number: '', client_id: '' }
        )
      )

      expect(schema).to have_jsonapi_attr_error({
        name: ["can't be blank"],
        subdomain: ["can't be blank"],
        number: ["can't be blank"],
        client_id: ["can't be blank"]
      })
    end
  end

  describe 'create' do
    include_examples 'create/update', 'create_request'
  end

  describe 'update' do
    include_examples 'create/update', 'update_request'

    it 'is valid even if some attributes are missing' do
      params_without_name = jsonapi_remove_attributes(valid_params, :name)
      schema = Api::V2::Projects::Schema.update_request.call(params_without_name)

      expect(schema.failure?).to eq(false)
    end
  end
end
