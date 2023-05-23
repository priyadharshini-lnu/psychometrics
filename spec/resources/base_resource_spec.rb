# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::BaseResource do
  let!(:superadmin) { create(:superadmin) }
  let!(:client_admin) { create(:client_admin) }
  let!(:context) do
    {
      user: superadmin,
      params: {}
    }
  end

  context 'include_resource_meta options' do
    it 'doesnt add meta if option include_resource_meta not passed in params' do
      user_resource = Api::V2::Administration::UserResource.new(client_admin, context)
      serialized_data = JSONAPI::ResourceSerializer.new(
        Api::V2::Administration::UserResource
      ).serialize_to_hash(user_resource)

      expect(serialized_data[:data]).not_to have_meta(
        {
          permissions: {
            'reset_password' => true,
            'remove' => true,
            'toggle_enable_2fa' => true
          }
        }
      )
    end

    it 'adds meta with provided keys for option include_resource_meta' do
      context[:params] = { include_resource_meta: 'permissions' }
      user_resource = Api::V2::Administration::UserResource.new(client_admin, context)
      serialized_data = JSONAPI::ResourceSerializer.new(
        Api::V2::Administration::UserResource
      ).serialize_to_hash(user_resource)

      expect(serialized_data[:data]).to have_meta(
        {
          permissions: {
            'reset_password' => true,
            'remove' => true,
            'toggle_enable_2fa' => true
          }
        }
      )
    end

    it 'adds meta with all keys for option include_resource_meta with *' do
      context[:params] = { include_resource_meta: '*' }
      user_resource = Api::V2::Administration::UserResource.new(client_admin, context)
      serialized_data = JSONAPI::ResourceSerializer.new(
        Api::V2::Administration::UserResource
      ).serialize_to_hash(user_resource)

      expect(serialized_data[:data]).to have_meta(
        {
          permissions: {
            'reset_password' => true,
            'remove' => true,
            'toggle_enable_2fa' => true
          }
        }
      )
    end
  end
end
