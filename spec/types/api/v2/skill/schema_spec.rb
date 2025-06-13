# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Skill::Schema do
  let(:valid_params) do
    jsonapi_resource_request(
      'skills',
      { id: '100', name: 'Skill Name', skill_type: 'Skill Type', description: 'Description', default_language: 'en' },
      { project: { id: '1', type: 'projects' } }
    )
  end

  shared_examples 'create/update' do |method|
    it 'validate presence of attributes' do
      schema = Api::V2::Skill::Schema.send(method).call(
        jsonapi_merge_attributes(
          valid_params,
          { name: '', skill_type: '', description: '' }
        )
      )

      expect(schema).to have_jsonapi_attr_error({
        name: ["can't be blank"],
        skill_type: ["can't be blank"],
        description: ["can't be blank"]
      })
    end

    it 'validates presence of type and id for project relationship' do
      schema = Api::V2::Skill::Schema.send(method).call(
        jsonapi_merge_relationships(
          valid_params,
          { project: { id: '', type: '' } }
        )
      )

      expect(schema).to have_jsonapi_relationship_error(
        project: { id: ["can't be blank"], type: ["can't be blank"] }
      )
    end
  end

  describe '.create_request' do
    include_examples 'create/update', :create_request
  end

  describe '.update_request' do
    include_examples 'create/update', :update_request
  end
end
