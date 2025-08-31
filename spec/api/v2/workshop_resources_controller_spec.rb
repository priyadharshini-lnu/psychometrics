# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::WorkshopResourcesController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:campaign_id) { campaign.id }
  let(:workshop) { create(:workshop, campaign_id: campaign_id) }
  let(:workshop_id) { workshop.id }
  let!(:resource) { create(:workshop_resource, workshop: workshop) }
  let(:resource_id) { resource.id }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/campaigns/{campaign_id}/workshops/{workshop_id}/workshop_resources' do
    get 'Workshop Resources List' do
      operationId 'WorkshopsResourcesList'
      description 'Fetch campaign Workshop Resources list'
      tags 'Campaign Scheduling'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :workshop_id, in: :path, type: :string

      response '200', 'Workshop Resources list' do
        schema '$ref' => '#/components/schemas/WorkshopResourcesListResponse'

        examples 'application/json' => {
          data: [
            {
              id: '1',
              type: 'resources',
              links: {
                self: 'http://www.example.com/api/v2/administration/workshop_resources/1'
              },
              attributes: {
                name: 'Resource name',
                url: 'http://resource.com'
              }
            }
          ],
          meta: {
            record_count: 1,
            page_count: 1
          }
        }

        run_test! do |response|
          resource_response = JSON.parse(response.body)['data'].first
          expect(resource_response).to have_attribute(:name).with_value('Resource name')
          expect(resource_response).to have_attribute(:url).with_value('http://resource.com')
        end
      end
    end

    post 'Create Workshop Resource' do
      operationId 'CreateWorkshopsResources'
      description 'Create Workshop Resource'
      tags 'Campaign Scheduling'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :workshop_id, in: :path, type: :string
      parameter name: :body, in: :body,
                schema: { '$ref' => '#/components/schemas/WorkshopResourcesCreateRequest' },
                required: true

      response '201', 'Workshop Resource created' do
        schema '$ref' => '#/components/schemas/WorkshopResourcesCreateRequest'

        examples 'application/json' => {
          data: {
            id: '14',
            type: 'workshop_resources',
            links: { self: 'http://localhost:3030/api/v2/administration/workshop_resources/14' },
            attributes: {
              name: 'test resource',
              url: 'http://resource.com',
              workshop_id: 10
            }
          },
          meta: {
            permissions: {
              index: true,
              create: true,
              destroy: true
            }
          }
        }

        let(:body) do
          {
            data: {
              type: 'workshop_resources',
              attributes: {
                name: 'test resource',
                url: 'http://newresource.com',
                workshop_id: workshop_id
              }
            }
          }
        end

        run_test! do |response|
          resource_response = JSON.parse(response.body)['data']
          expect(resource_response).to have_key('id')
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/workshops/{workshop_id}/workshop_resources/{resource_id}' do
    patch 'Update Workshop Resource' do
      operationId 'UpdateWorkshopsResources'
      description 'Update Workshop Resource'
      tags 'Campaign Scheduling'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :workshop_id, in: :path, type: :string
      parameter name: :resource_id, in: :path, type: :string
      parameter name: :body, in: :body,
                schema: { '$ref' => '#/components/schemas/WorkshopResourcesUpdateRequest' },
                required: true

      response '200', 'Workshop Resource updated' do
        schema '$ref' => '#/components/schemas/WorkshopResourcesUpdateRequest'

        examples 'application/json' => {
          data: {
            id: '14',
            type: 'workshop_resources',
            links: { self: 'http://localhost:3030/api/v2/administration/workshop_resources/14' },
            attributes: {
              name: 'test resource',
              url: 'http://resource.com',
              workshop_id: 10
            }
          },
          meta: {
            permissions: {
              index: true,
              create: true,
              destroy: true
            }
          }
        }

        let(:body) do
          {
            data: {
              id: resource_id.to_s,
              type: 'workshop_resources',
              attributes: {
                name: 'changed resource name',
                url: 'http://newresourceurl.com',
                workshop_id: workshop_id
              }
            }
          }
        end

        run_test! do |response|
          resource_response = JSON.parse(response.body)['data']
          expect(resource_response).to have_attribute(:name).with_value('changed resource name')
          expect(resource_response).to have_attribute(:url).with_value('http://newresourceurl.com')
        end
      end
    end

    delete 'Delete Workshop Resource' do
      operationId 'DeleteWorkshopsResources'
      description 'Delete Workshop Resource'
      tags 'Campaign Scheduling'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :workshop_id, in: :path, type: :string
      parameter name: :resource_id, in: :path, type: :string

      response '204', 'Workshop Resource deleted' do
        run_test! do |response|
          expect(response.body).to eq('')
          expect { WorkshopResource.find(resource_id) }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end
    end
  end
end
