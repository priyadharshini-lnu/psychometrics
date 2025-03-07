# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::LicensesController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:membership) { create(:client_admin_membership) }
  let!(:client) { create(:tenancy) }
  let!(:project) { create(:project, parent: membership.client) }
  let!(:license) { create(:license, client: client) }
  let(:client_id) { client.id.to_s }
  let(:license_id) { license.id.to_s }
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/clients/{client_id}/licenses' do
    get 'Licenses List' do
      operationId 'LicensesList'
      description 'Fetch client Licenses list'
      tags 'Licenses'
      consumes 'application/json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string

      response '200', 'Licenses list' do
        schema '$ref' => '#/components/schemas/LicensesListResponse'

        examples 'application/json' => [{
          data: {
            id: '52',
            type: 'licenses',
            links: {
              self: 'http://do.main/api/v2/administration/licenses/52'
            },
            attributes: {
              number: 100,
              overuse_number: 0,
              used_number: 1,
              start_date: '2017-05-01',
              end_date: '2021-01-01',
              report_family_id: 2,
              disabled: false,
              type: 'common'
            },
            relationships: {
              client: {
                data: {
                  type: 'clients',
                  id: '100'
                }
              },
              report_family: {
                data: {
                  type: 'report_families',
                  id: '2'
                }
              }
            }
          }
        }]

        run_test! do |response|
          licenses = JSON.parse(response.body)
          license_response = licenses['data'].find { |c| c['id'] == license_id }

          expect(license_response).to have_attribute(:number).with_value(license.number)
          expect(license_response).to have_attribute(:overuse_number).with_value(license.overuse_number)
          expect(license_response).to have_relationship(:client).with_data({ 'id' => client_id, 'type' => 'clients' })
          expect(license_response).to have_relationship(:report_family).
            with_data({ 'id' => license.report_family_id.to_s, 'type' => 'report_families' })
        end
      end
    end

    post 'Create License' do
      operationId 'CreateLicense'
      description 'Create new License'
      tags 'Licenses'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string
      parameter name: :body,
                in: :body,
                schema: { '$ref' => '#/components/schemas/LicenseCreateRequest' },
                required: true

      response '201', 'License Created' do
        schema '$ref' => '#/components/schemas/LicenseResponse'
        examples 'application/json' => {
          data: {
            type: 'licenses',
            attributes: {
              number: 100,
              overuse_number: 0,
              used_number: 1,
              start_date: '2017-05-01',
              end_date: '2021-01-01',
              report_family_id: 2,
              disabled: false,
              type: 'common'
            },
            relationships: {
              report_family: {
                data: {
                  type: 'report_families',
                  id: '2'
                }
              }
            }
          }
        }

        let(:body) do
          {
            data: {
              type: 'licenses',
              attributes: {
                number: 100,
                overuse_number: 0,
                used_number: 1,
                start_date: '2017-05-01',
                end_date: '2021-01-01',
                report_family_id: 2,
                disabled: false,
                type: 'common'
              },
              relationships: {
                report_family: {
                  data: {
                    type: 'report_families',
                    id: license.report_family_id.to_s
                  }
                }
              }
            }
          }
        end

        run_test! do |response|
          license_response = JSON.parse(response.body)['data']

          expect(license_response).to have_key('id')
          expect(license_response).to have_attribute(:number).with_value(100)
          expect(license_response).to have_attribute(:overuse_number).with_value(0)
          expect(license_response).to have_attribute(:client_id).with_value(client.id)
          expect(license_response).to have_relationship(:client).with_data({ 'id' => client_id, 'type' => 'clients' })
          expect(license_response).to have_relationship(:report_family).
            with_data({ 'id' => license.report_family_id.to_s, 'type' => 'report_families' })
        end
      end
    end
  end

  path '/clients/{client_id}/licenses/{license_id}' do
    patch 'Update a license' do
      operationId 'UpdateLicense'
      description 'Update a License'
      tags 'Licenses'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string
      parameter name: :license_id, in: :path, type: :string
      parameter name: :body,
                in: :body,
                schema: { '$ref' => '#/components/schemas/LicenseUpdateRequest' },
                required: true

      response '200', 'License Updated' do
        schema '$ref' => '#/components/schemas/LicenseResponse'
        examples 'application/json' => {
          data: {
            type: 'licenses',
            id: '87',
            attributes: {
              number: 100,
              overuse_number: 0,
              used_number: 1,
              start_date: '2017-05-01',
              end_date: '2021-01-01',
              report_family_id: 2,
              disabled: false,
              type: 'common'
            },
            relationships: {
              report_family: {
                data: {
                  type: 'report_families',
                  id: '2'
                }
              }
            }
          }
        }

        let(:body) do
          {
            data: {
              type: 'licenses',
              id: license_id,
              attributes: {
                number: 101,
                overuse_number: 1,
                start_date: '2017-05-01',
                end_date: '2025-01-01',
                type: 'common'
              },
              relationships: {
                report_family: {
                  data: {
                    type: 'report_families',
                    id: license.report_family_id.to_s
                  }
                }
              }
            }
          }
        end

        run_test! do |response|
          license_response = JSON.parse(response.body)['data']

          expect(license_response).to have_attribute(:number).with_value(101)
          expect(license_response).to have_attribute(:overuse_number).with_value(1)
          expect(license_response).to have_relationship(:client).with_data({ 'id' => client_id, 'type' => 'clients' })
          expect(license_response).to have_relationship(:report_family).
            with_data({ 'id' => license.report_family_id.to_s, 'type' => 'report_families' })
        end
      end
    end
  end
end
