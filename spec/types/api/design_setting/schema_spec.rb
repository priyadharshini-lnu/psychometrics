# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::DesignSetting::Schema do
  let(:valid_params) do
    jsonapi_resource_request(
      'design_settings',
      {
        id: '1',
        background_color: '#ffffff',
        error_color: '#ffffff',
        info_color: '#ffffff',
        login_box_position: '#ffffff',
        primary_color: '#ffffff',
        success_color: '#ffffff',
        warning_color: '#ffffff'
      },
      { project: { id: '2', type: 'projects' } }
    )
  end

  describe 'update' do
    it 'validates presence of type and id for campaign relationship' do
      schema = Api::V2::DesignSetting::Schema.update_request.call(
        jsonapi_merge_relationships(
          valid_params,
          { project: { id: '', type: '' } }
        )
      )

      expect(schema).to have_jsonapi_relationship_error(
        project: { id: ["can't be blank"], type: ["can't be blank"] }
      )
    end

    it 'passes validation for valid params' do
      schema = Api::V2::DesignSetting::Schema.update_request.call(valid_params)

      expect(schema.failure?).to eq(false)
    end

    it 'is valid even if some attributes are missing' do
      params_without_attrs = jsonapi_remove_attributes(valid_params, :background_color)
      schema = Api::V2::DesignSetting::Schema.update_request.call(params_without_attrs)

      expect(schema.failure?).to eq(false)
    end

    it 'is invalid if some attributes are wrong type' do
      wrong_params = jsonapi_merge_attributes(
        valid_params,
        { background_color: 123 }
      )
      schema = Api::V2::DesignSetting::Schema.update_request.call(wrong_params)

      expect(schema.failure?).to eq(true)
      expect(schema).to have_jsonapi_attr_error(
        { background_color: ['must be a string'] }
      )
    end

    it 'is valid even if some relationship are missing' do
      schema = Api::V2::DesignSetting::Schema.update_request.call(
        jsonapi_remove_relationships(valid_params, :project)
      )

      expect(schema.failure?).to eq(false)
    end
  end
end
