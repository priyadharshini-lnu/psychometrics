# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Client::Schema do
  let(:valid_params) do
    jsonapi_resource_request(
      'clients',
      { id: '100', name: 'Client Name', number: '123', year: Time.now.year, type: 'partner', country: 'UAE' },
      { project_manager: { id: '1', type: 'users' } }
    )
  end

  shared_examples 'create/update' do |method|
    it 'validate presence of attributes' do
      schema = Api::V2::Client::Schema.send(method).call(
        jsonapi_merge_attributes(
          valid_params,
          { name: '', number: '', type: '', country: '' }
        )
      )

      expect(schema).to have_jsonapi_attr_error({
        name: ["can't be blank"],
        number: ["can't be blank"],
        type: ["can't be blank"],
        country: ["can't be blank"]
      })
    end

    it 'validates presence of type and id for project_manage relationship' do
      schema = Api::V2::Client::Schema.send(method).call(
        jsonapi_merge_relationships(
          valid_params,
          { project_manager: { id: '', type: '' } }
        )
      )

      expect(schema).to have_jsonapi_relationship_error(
        project_manager: { id: ["can't be blank"], type: ["can't be blank"] }
      )
    end

    it 'validates year is a integer' do
      schema = Api::V2::Client::Schema.send(method).call(
        jsonapi_merge_attributes(valid_params, year: '')
      )

      expect(schema).to have_jsonapi_attr_error({ year: ['must be an integer'] })
    end

    it 'validates year range' do
      schema = Api::V2::Client::Schema.send(method).call(
        jsonapi_merge_attributes(valid_params, year: Time.zone.now.advance(years: -10.years).year)
      )
      expect(schema).to have_jsonapi_attr_error(year: ["must be greater than or equal to #{Time.zone.now.year - 2}"])

      schema = Api::V2::Client::Schema.send(method).call(
        jsonapi_merge_attributes(valid_params, year: Time.zone.now.advance(years: 20.years).year)
      )
      expect(schema).to have_jsonapi_attr_error({ year: ["must be less than or equal to #{Time.zone.now.year + 10}"] })
    end

    it 'passes validation for valid params' do
      schema = Api::V2::Client::Schema.send(method).call(valid_params)

      expect(schema.failure?).to eq(false)
    end
  end

  describe 'create' do
    include_examples 'create/update', 'create_request'
  end

  describe 'update' do
    include_examples 'create/update', 'update_request'

    it 'is valid even if some attributes are missing' do
      valid_params_without_name = jsonapi_remove_attributes(valid_params, :name)
      schema = Api::V2::Client::Schema.update_request.call(valid_params_without_name)

      expect(schema.failure?).to eq(false)
    end

    it 'is valid even if some relationship are missing' do
      valid_params_without_project_manager = jsonapi_remove_relationships(valid_params, :project_manager)
      schema = Api::V2::Client::Schema.update_request.call(
        valid_params_without_project_manager
      )

      expect(schema.failure?).to eq(false)
    end
  end
end
