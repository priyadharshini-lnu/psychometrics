# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::IdpTemplate::UpdateInstructionsContract do
  let(:contract) do
    described_class.new(schema: Api::V2::IdpTemplate::Schema.update_instructions_request)
  end

  let(:valid_params) do
    jsonapi_resource_request(
      'idp_templates',
      {
        instructions: {
          content: 'Valid instruction content'
        },
        locale: 'en'
      }
    )
  end

  describe 'validations' do
    context 'when instructions content is present' do
      it 'passes validation' do
        result = contract.call(valid_params)

        expect(result.failure?).to eq(false)
      end
    end

    context 'when instructions content is blank' do
      it 'fails with content_required error' do
        params = jsonapi_resource_request(
          'idp_templates',
          {
            instructions: {
              content: ''
            },
            locale: 'en'
          }
        )
        result = contract.call(params)

        expect(result.failure?).to eq(true)
        expect(result).to have_jsonapi_attr_error(
          instructions: ['Content is required for instructions']
        )
      end
    end

    context 'when instructions content is nil' do
      it 'fails with content_required error' do
        params = jsonapi_resource_request(
          'idp_templates',
          {
            instructions: {
              content: nil
            },
            locale: 'en'
          }
        )
        result = contract.call(params)

        expect(result.failure?).to eq(true)
        expect(result).to have_jsonapi_attr_error(
          instructions: ['Content is required for instructions']
        )
      end
    end

    context 'when instructions is not a hash' do
      it 'fails schema validation because instructions must be a hash' do
        params = jsonapi_resource_request(
          'idp_templates',
          {
            instructions: 'string value',
            locale: 'en'
          }
        )
        result = contract.call(params)

        expect(result.failure?).to eq(true)
        expect(result).to have_jsonapi_attr_error(
          instructions: ['must be a hash']
        )
      end
    end

    context 'when instructions hash has content key with whitespace only' do
      it 'fails with content_required error' do
        params = jsonapi_resource_request(
          'idp_templates',
          {
            instructions: {
              content: '   '
            },
            locale: 'en'
          }
        )
        result = contract.call(params)

        expect(result.failure?).to eq(true)
        expect(result).to have_jsonapi_attr_error(
          instructions: ['Content is required for instructions']
        )
      end
    end

    context 'when instructions hash is missing content key' do
      it 'fails with content_required error' do
        params = jsonapi_resource_request(
          'idp_templates',
          {
            instructions: {
              other_key: 'some value'
            },
            locale: 'en'
          }
        )
        result = contract.call(params)

        expect(result.failure?).to eq(true)
        expect(result).to have_jsonapi_attr_error(
          instructions: ['Content is required for instructions']
        )
      end
    end

    context 'when locale is missing' do
      it 'fails validation due to schema requirement' do
        params = jsonapi_resource_request(
          'idp_templates',
          {
            instructions: {
              content: 'Valid content'
            }
          }
        )
        result = contract.call(params)

        expect(result.failure?).to eq(true)
        expect(result).to have_jsonapi_attr_error(
          locale: ["can't be blank"]
        )
      end
    end

    context 'when locale is blank' do
      it 'fails validation due to schema requirement' do
        params = jsonapi_resource_request(
          'idp_templates',
          {
            instructions: {
              content: 'Valid content'
            },
            locale: ''
          }
        )
        result = contract.call(params)

        expect(result.failure?).to eq(true)
        expect(result).to have_jsonapi_attr_error(
          locale: ["can't be blank"]
        )
      end
    end
  end
end
