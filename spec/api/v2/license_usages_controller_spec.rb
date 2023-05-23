# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::LicenseUsagesController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:membership) { create(:client_admin_membership) }
  let!(:client) { create(:tenancy) }
  let!(:project) { create(:project, parent: membership.client) }
  let!(:license) { create(:license, client: client) }
  let!(:usage) { create(:license_usage, :active, :updated, license: license, client: client) }
  let(:client_id) { client.id.to_s }
  let(:license_id) { license.id.to_s }
  let(:license_usage_id) { usage.id }
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/clients/{client_id}/licenses/{license_id}/license_usages' do
    get 'License Usages List' do
      operationId 'LicenseUsagesList'
      description 'Fetch client License Usages list'
      tags 'Licenses'
      consumes 'application/json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string
      parameter name: :license_id, in: :path, type: :string

      response '200', 'License Usages list' do
        schema '$ref' => '#/components/schemas/LicenseUsageListResponse'

        examples 'application/json' => [{
          data: {
            id: '52',
            type: 'license_usages',
            links: {
              self: 'http://do.main/api/v2/administration/license_usages/29283'
            },
            attributes: {
              campaign_id: nil,
              created_at: '2019-07-28T02:41:04.221+04:00',
              status_updated_at: '2023-04-24T14:45:45.308+04:00',
              status_updated_by_id: 176,
              extras: {},
              status: 'active'
            },
            relationships: {
              campaign: {
                data: nil
              },
              user: {
                data: {
                  type: 'users',
                  id: '829'
                }
              },
              status_updated_by: {
                data: {
                  type: 'users',
                  id: '176'
                }
              }
            }
          }
        }]

        run_test! do |response|
          license_usage = JSON.parse(response.body)
          usage_response = license_usage['data'].find { |c| c['id'] == usage.id.to_s }

          expect(usage_response).to have_attribute(:status).with_value('active')
          expect(usage_response).to have_relationship(:status_updated_by).with_data(
            { 'id' => usage.status_updated_by_id.to_s, 'type' => 'users' }
          )
        end
      end
    end
  end

  path '/clients/{client_id}/licenses/{license_id}/license_usages/{license_usage_id}/toggle_status' do
    post 'Toggle License Usage Status' do
      operationId 'LicenseUsageToggleStatus'
      description 'Toggle License Usage status'
      tags 'Licenses'
      consumes 'application/json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string
      parameter name: :license_id, in: :path, type: :string
      parameter name: :license_usage_id, in: :path, type: :string

      response '200', 'License Usage toggle status' do
        schema '$ref' => '#/components/schemas/LicenseUsageResponse'

        examples 'application/json' => [{
          data: {
            id: '52',
            type: 'license_usages',
            links: {
              self: 'http://do.main/api/v2/administration/license_usages/29283'
            },
            attributes: {
              campaign_id: nil,
              created_at: '2019-07-28T02:41:04.221+04:00',
              status_updated_at: '2023-04-24T14:45:45.308+04:00',
              status_updated_by_id: 176,
              extras: {},
              status: 'inactive'
            },
            relationships: {
              campaign: {
                data: nil
              },
              user: {
                data: {
                  type: 'users',
                  id: '829'
                }
              },
              status_updated_by: {
                data: {
                  type: 'users',
                  id: '176'
                }
              }
            }
          }
        }]

        run_test! do |response|
          usage_response = JSON.parse(response.body)['data']

          expect(usage_response).to have_attribute(:status).with_value('inactive')
        end
      end
    end
  end
end
