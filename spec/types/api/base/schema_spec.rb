# frozen_string_literal: true

require 'rails_helper'

class TestSchema < Api::Base::Schema
  def self.resource
    'clients'
  end

  def self.define_schema(&)
    Dry::Schema.define do
      instance_eval(&)
    end
  end

  def self.attributes(attribute, _)
    proc do
      attribute[:name].filled(:string)
    end
  end

  def self.relationships(_)
    [
      { name: :has_one_required_false, resource: :users, relationship: :one, required: false, allowed_blank: false },
      { name: :has_one_required_true, resource: :users, relationship: :one, required: true },
      { name: :has_one_required_allow_blank, resource: :users, relationship: :one, allowed_blank: true },
      { name: :has_many_required_false, resource: :users, relationship: :many, required: false, allowed_blank: false },
      { name: :has_many_required_true, resource: :users, relationship: :many, required: true },
      { name: :has_many_required_allow_blank, resource: :users, relationship: :many, allowed_blank: true }
    ]
  end
end

describe Api::Base::Schema do
  let(:relationships) do
    {
      has_one_required_false: { id: '1', type: 'users' },
      has_one_required_true: { id: '2', type: 'users' },
      has_one_required_allow_blank: { id: '3', type: 'users' },
      has_many_required_false: [{ id: '4', type: 'users' }],
      has_many_required_true: [{ id: '5', type: 'users' }],
      has_many_required_allow_blank: [{ id: '6', type: 'users' }]
    }
  end

  let(:valid_params_for_create) do
    jsonapi_resource_request(
      'clients',
      { name: 'Client Name' },
      relationships
    )
  end
  let(:valid_params_for_update) do
    jsonapi_resource_request(
      'clients',
      { id: '1', types: 'clients', name: 'Client Name' },
      relationships
    )
  end

  shared_examples 'create/update_request' do |method_name|
    let(:valid_params) do
      if method_name == 'create_request'
        valid_params_for_create
      else
        valid_params_for_update
      end
    end

    it 'validates is not blank attribute' do
      params_without_name = jsonapi_merge_attributes(valid_params, { name: '' })
      schema = TestSchema.send(method_name).call(params_without_name)

      expect(schema).to have_jsonapi_attr_error(name: ["can't be blank"])
    end

    it 'validates type of attribute' do
      params_without_name = jsonapi_merge_attributes(valid_params, { name: 123 })
      schema = TestSchema.send(method_name).call(params_without_name)

      expect(schema).to have_jsonapi_attr_error(name: ['must be a string'])
    end

    it 'null allowed for allowed_blank relationships' do
      nil_has_one_params = jsonapi_merge_relationships(
        valid_params,
        has_one_required_allow_blank: nil
      )
      schema = TestSchema.send(method_name).call(nil_has_one_params)
      expect(schema.failure?).to eq(false)

      nil_has_many_params = jsonapi_merge_relationships(
        valid_params,
        has_many_required_allow_blank: nil
      )
      schema = TestSchema.send(method_name).call(nil_has_many_params)
      expect(schema.failure?).to eq(false)
    end

    it 'null are not allowed if allowed_blank relationships' do
      nil_has_one_params = jsonapi_merge_relationships(
        valid_params,
        has_one_required_false: nil
      )
      schema = TestSchema.send(method_name).call(nil_has_one_params)
      expect(schema).to have_jsonapi_relationship_error(has_one_required_false: ['must be a hash'])

      nil_has_many_params = jsonapi_merge_relationships(
        valid_params,
        has_many_required_false: nil
      )
      schema = TestSchema.send(method_name).call(nil_has_many_params)
      expect(schema).to have_jsonapi_relationship_error(has_many_required_false: ['must be an array'])
    end

    it 'validates presence of required relationships' do
      params_without_has_one = jsonapi_remove_relationships(valid_params, :has_one_required_true)
      schema = TestSchema.send(method_name).call(params_without_has_one)
      expect(schema).to have_jsonapi_relationship_error(has_one_required_true: ["can't be blank"])

      params_without_has_many = jsonapi_remove_relationships(valid_params, :has_many_required_true)
      schema = TestSchema.send(method_name).call(params_without_has_many)
      expect(schema).to have_jsonapi_relationship_error(has_many_required_true: ["can't be blank"])
    end

    it 'passes if not required relationships are absent' do
      params_without_has_one = jsonapi_remove_relationships(valid_params, :has_one_required_false)
      schema = TestSchema.send(method_name).call(params_without_has_one)
      expect(schema.failure?).to eq(false)

      params_without_has_one = jsonapi_remove_relationships(valid_params, :has_many_required_false)
      schema = TestSchema.send(method_name).call(params_without_has_one)
      expect(schema.failure?).to eq(false)
    end

    it 'passes if attribute value is valid' do
      schema = TestSchema.send(method_name).call(valid_params)

      expect(schema.failure?).to eq(false)
    end
  end

  describe 'create_request' do
    include_examples 'create/update_request', 'create_request'
  end

  describe 'update_request' do
    include_examples 'create/update_request', 'update_request'

    it 'passes if non required relationship is not passed ' do
      params_without_has_one = jsonapi_remove_relationships(valid_params_for_update, :has_one_required_false)
      schema = TestSchema.update_request.call(params_without_has_one)
      expect(schema.failure?).to eq(false)

      params_without_has_many = jsonapi_remove_relationships(valid_params_for_update, :has_many_required_false)
      schema = TestSchema.update_request.call(params_without_has_many)
      expect(schema.failure?).to eq(false)
    end

    it 'passes if attribute is not present' do
      params_without_name = jsonapi_remove_attributes(valid_params_for_update, :name)
      schema = TestSchema.update_request.call(params_without_name)

      expect(schema.failure?).to eq(false)
    end
  end

  shared_examples 'create/update_relationship_request' do |method_name|
    it 'raises exception if relationship is not present' do
      expect do
        TestSchema.send(method_name, :absent_relationship).call({
          data: { type: 'users', id: '1' }
        })
      end.to raise_error('No such relationship')
    end

    context 'has_one' do
      it 'validates presence of data key in params' do
        schema = TestSchema.send(method_name, :has_one_required_false).call({})
        expect(schema.errors.to_h).to eq({
          data: ["can't be blank"]
        })
      end

      it 'passes with correct data' do
        schema = TestSchema.send(method_name, :has_one_required_false).call({
          data: { type: '', id: '' }
        })

        expect(schema.errors.to_h).to eq({
          data: { type: ["can't be blank"], id: ["can't be blank"] }
        })
      end
    end

    context 'has_many' do
      it 'validates presence of data key in params' do
        schema = TestSchema.send(method_name, :has_many_required_false).call({})
        expect(schema.errors.to_h).to eq({
          data: ["can't be blank"]
        })
      end

      it 'validates data is a array' do
        schema = TestSchema.send(method_name, :has_many_required_false).call({
          data: { type: 'users', id: '1' }
        })

        expect(schema.errors.to_h).to eq({
          data: ['must be an array']
        })
      end

      it 'passes with correct data' do
        schema = TestSchema.send(method_name, :has_many_required_false).call({
          data: [{ type: 'users', id: '1' }, { type: 'users', id: '2' }]
        })

        expect(schema.failure?).to eq(false)
      end
    end
  end

  describe 'create_relationship_request' do
    include_examples 'create/update_relationship_request', 'create_relationship_request'
  end

  describe 'update_relationship_request' do
    include_examples 'create/update_relationship_request', 'update_relationship_request'
  end

  describe 'Response Types' do
    class TestResponseSchema < TestSchema # rubocop:disable Lint/ConstantDefinitionInBlock
      def self.relationships(_)
        [
          { name: :has_one, resource: :users, relationship: :one, required: false, allowed_blank: false },
          { name: :has_many, resource: :users, relationship: :many, required: false, allowed_blank: false }
        ]
      end

      def self.extra_index_meta_schema
        proc do
          required(:types).array(:str?)
        end
      end
    end

    describe 'single_response' do
      it 'verify correct schema' do
        schema = TestResponseSchema.single_resource_response.call(
          jsonapi_resource_request(
            'clients',
            { id: '12', name: 'Client Name' },
            has_one: { type: 'users', id: '1' },
            has_many: [{ type: 'users', id: '2' }]
          ).deep_merge(
            data: { links: { self: 'http://example.com/clients/12' } }
          )
        )

        expect(schema.failure?).to eq(false)
      end
    end

    describe 'multiple_response' do
      it 'verify correct schema' do
        resource1 = jsonapi_resource_request(
          'clients',
          { id: '11', name: 'Client Name' },
          has_one: { type: 'users', id: '1' },
          has_many: [{ type: 'users', id: '2' }]
        ).deep_merge(
          data: { links: { self: 'http://example.com/clients/12' } }
        )

        resource2 = jsonapi_resource_request(
          'clients',
          { id: '12', name: 'Client Name2' },
          has_one: { type: 'users', id: '4' },
          has_many: [type: 'users', id: '5']
        ).deep_merge(
          data: { links: { self: 'http://example.com/clients/12' } }
        )
        schema = TestResponseSchema.multiple_resource_response.call({
          data: [resource1[:data], resource2[:data]],
          meta: { record_count: 10, page_count: 2, types: %w[clients users] }
        })

        expect(schema.failure?).to eq(false)
      end
    end
  end
end
