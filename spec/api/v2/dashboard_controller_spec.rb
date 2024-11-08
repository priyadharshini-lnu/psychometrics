# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::DashboardsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:dashboard) { create(:dashboard) }
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/dashboards/' do
    get 'Dashboards List' do
      operationId 'DashboardsList'
      description 'Fetch Dashboards list'
      tags 'Dashboards'
      consumes 'application/json'
      security [basic: []]

      response '200', 'Dashboard list' do
        schema '$ref' => '#/components/schemas/DashboardsListResponse'

        examples 'application/json' => [{
          type: 'dashboards',
          data: {
            id: '770',
            attributes: {
              dashboard_type: 'powerbi',
              name: 'New Dashboard',
              enabled: true,
              dataset_id: 'd_100',
              report_id: 'r_100'
            },
            relationships: {
              campaign: {
                data: {
                  id: '1',
                  type: 'campaigns'
                }
              }
            }
          }
        }]

        run_test! do |response|
          dashboards = JSON.parse(response.body)
          dashboard_response = dashboards['data'].find { |d| d['id'] == dashboard.id.to_s }
          expect(dashboard_response).to have_key('id')
          expect(dashboard_response).to have_attribute(:name).with_value(dashboard.name)
          expect(dashboard_response).to have_relationship(:campaign).
            with_data({ 'id' => dashboard.campaign_id.to_s, 'type' => 'campaigns' })
        end
      end
    end
  end

  path '/dashboards/{dashboard_id}' do
    get 'Dashboard' do
      operationId 'Dashboard'
      description 'Fetch Dashboard'
      tags 'Dashboards'
      consumes 'application/json'
      security [basic: []]
      parameter name: :dashboard_id, in: :path, type: :string

      response '200', 'Dashboard' do
        schema '$ref' => '#/components/schemas/DashboardResponse'

        examples 'application/json' => [{
          type: 'dashboards',
          data: {
            id: '770',
            attributes: {
              dashboard_type: 'powerbi',
              name: 'New Dashboard',
              enabled: true,
              dataset_id: 'd_100',
              report_id: 'r_100'
            },
            relationships: {
              campaign: {
                data: {
                  id: '1',
                  type: 'campaigns'
                }
              }
            }
          }
        }]

        let(:dashboard) { create(:dashboard) }
        let(:dashboard_id) { dashboard.id }

        run_test! do |response|
          dashboard_response = JSON.parse(response.body)['data']
          expect(dashboard_response).to have_key('id')
          expect(dashboard_response).to have_attribute(:name).with_value(dashboard.name)
          expect(dashboard_response).to have_relationship(:campaign).
            with_data({ 'id' => dashboard.campaign_id.to_s, 'type' => 'campaigns' })
        end
      end
    end
  end

  path '/dashboards/' do
    post 'Create a dashboard' do
      operationId 'CreateDashboard'
      description 'Create new Dashboard'
      tags 'Dashboards'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/DashboardCreateRequest' },
                required: true

      response '201', 'Dashboard Created' do
        schema '$ref' => '#/components/schemas/DashboardResponse'

        examples 'application/json' => [{
          type: 'dashboards',
          data: {
            attributes: {
              dashboard_type: 'powerbi',
              name: 'New Dashboard',
              enabled: true,
              dataset_id: 'd_100',
              report_id: 'r_100'
            },
            relationships: {
              campaign: {
                data: {
                  id: '1',
                  type: 'campaigns'
                }
              }
            }
          }
        }]
        let(:campaign) { create(:campaign) }
        let(:body) do
          jsonapi_resource_request(
            'dashboards',
            { dashboard_type: 'powerbi', name: 'New Dashboard', enabled: true, dataset_id: 'd_100',
              report_id: 'r_100' },
            { campaign: { id: campaign.id.to_s, type: 'campaigns' } }
          )
        end

        run_test! do |response|
          dashboard_response = JSON.parse(response.body)['data']
          expect(dashboard_response).to have_key('id')
          expect(dashboard_response).to have_attribute(:name).with_value('New Dashboard')
          expect(dashboard_response).to have_attribute(:enabled).with_value(true)
          expect(dashboard_response).to have_attribute(:dataset_id).with_value('d_100')
          expect(dashboard_response).to have_attribute(:report_id).with_value('r_100')
          expect(dashboard_response).to have_relationship(:campaign).
            with_data({ 'id' => campaign.id.to_s, 'type' => 'campaigns' })
        end
      end
    end
  end

  path '/dashboards/{dashboard_id}' do
    patch 'Update a dashboard' do
      operationId 'UpdateDashboard'
      description 'Update Dashboard'
      tags 'Dashboards'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :dashboard_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/DashboardUpdateRequest' },
                required: true

      response '200', 'Dashboard Created' do
        schema '$ref' => '#/components/schemas/DashboardResponse'

        examples 'application/json' => [{
          type: 'dashboards',
          data: {
            id: '770',
            attributes: {
              dashboard_type: 'powerbi',
              name: 'New Dashboard',
              enabled: true,
              dataset_id: 'd_100',
              report_id: 'r_100'
            },
            relationships: {
              campaign: {
                data: {
                  id: '1',
                  type: 'campaigns'
                }
              }
            }
          }
        }]

        let(:dashboard_id) { dashboard.id }
        let(:campaign) { dashboard.campaign }
        let(:body) do
          jsonapi_resource_request(
            'dashboards',
            { id: dashboard.id.to_s, name: 'New Dashboard1', enabled: true, dataset_id: 'd_200', report_id: 'r_200' },
            { campaign: { id: campaign.id.to_s, type: 'campaigns' } }
          )
        end

        run_test! do |response|
          dashboard_response = JSON.parse(response.body)['data']
          expect(dashboard_response).to have_key('id')
          expect(dashboard_response).to have_attribute(:name).with_value('New Dashboard1')
          expect(dashboard_response).to have_attribute(:enabled).with_value(true)
          expect(dashboard_response).to have_attribute(:dataset_id).with_value('d_200')
          expect(dashboard_response).to have_attribute(:report_id).with_value('r_200')
          expect(dashboard_response).to have_relationship(:campaign).
            with_data({ 'id' => campaign.id.to_s, 'type' => 'campaigns' })
        end
      end
    end
  end
end
