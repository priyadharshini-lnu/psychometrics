# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Dashboard::Schema do
  let(:valid_params) do
    jsonapi_resource_request(
      'dashboards',
      { id: '1', dashboard_type: 'powerbi', name: 'New Dashboard', enabled: true, dataset_id: 'd_100',
        report_id: 'r_100' },
      { campaign: { id: '2', type: 'campaigns' } }
    )
  end

  shared_examples 'create/update' do |method|
    it 'validate presence of attributes' do
      schema = Api::V2::Dashboard::Schema.send(method).call(
        jsonapi_merge_attributes(
          valid_params,
          { name: '' }
        )
      )

      expect(schema).to have_jsonapi_attr_error({ name: ["can't be blank"] })
    end

    it 'validates presence of type and id for campaign relationship' do
      schema = Api::V2::Dashboard::Schema.send(method).call(
        jsonapi_merge_relationships(
          valid_params,
          { campaign: { id: '', type: '' } }
        )
      )

      expect(schema).to have_jsonapi_relationship_error(
        campaign: { id: ["can't be blank"], type: ["can't be blank"] }
      )
    end

    it 'passes validation for valid params' do
      schema = Api::V2::Dashboard::Schema.send(method).call(valid_params)

      expect(schema.failure?).to eq(false)
    end
  end

  describe 'create' do
    include_examples 'create/update', 'create_request'
  end

  describe 'update' do
    include_examples 'create/update', 'update_request'

    it 'is valid even if some attributes are missing' do
      params_without_name = jsonapi_remove_attributes(valid_params, :name)
      schema = Api::V2::Dashboard::Schema.update_request.call(params_without_name)

      expect(schema.failure?).to eq(false)
    end

    it 'is valid even if some relationship are missing' do
      schema = Api::V2::Dashboard::Schema.update_request.call(
        jsonapi_remove_relationships(valid_params, :campaign)
      )

      expect(schema.failure?).to eq(false)
    end
  end
end
