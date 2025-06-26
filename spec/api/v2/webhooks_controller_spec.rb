# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::WebhooksController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:project) { create(:project, subdomain: 'project-subdomain') }
  let!(:webhook) { create(:webhook, project_id: project.id) }
  let!(:webhook_id) { webhook.id }
  let!(:project_id) { project.id }
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/projects/{project_id}/webhooks/' do
    get 'Webhook List' do
      operationId 'WebhooksList'
      description 'Fetch Webhook list'

      tags 'Webhook'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string

      response '200', 'Webhook list' do
        schema '$ref' => '#/components/schemas/WebhookListResponse'

        examples 'application/json' => [{
          type: 'webhooks',
          data: {
            id: '1',
            attributes: {
              description: 'webhook description',
              url: 'http://www.dummy_webhook.com',
              active: false,
              auth_type: 'none',
              username: 'Jon'
            }
          }
        }]

        run_test! do |response|
          webhooks = JSON.parse(response.body)
          webhook_response = webhooks['data'].find { |c| c['id'] == webhook.id.to_s }
          expect(webhook_response).to have_key('id')
          expect(webhook_response).to have_attribute(:url).with_value(webhook.url)
        end
      end
    end
  end

  path '/projects/{project_id}/webhooks/' do
    post 'Create a Webhook' do
      operationId 'CreateWebhhook'
      description 'Create new Webhook'
      tags 'Webhooks'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :body, in: :body,
                schema: { '$ref' => '#/components/schemas/WebhookCreateRequest' },
                required: true

      response '201', 'Webhook Created' do
        schema '$ref' => '#/components/schemas/WebhookResponse'
        examples 'application/json' => {
          data: {
            type: 'webhooks',
            attributes: {
              description: 'webhook description',
              url: 'http://www.dummy_webhook.com',
              active: false,
              auth_type: 'none',
              username: 'Jon',
              rate_limit: 100,
              rate_limit_period: 1
            }
          }
        }

        let(:body) do
          {
            data: {
              type: 'webhooks',
              attributes: {
                description: 'webhook description',
                url: 'http://www.dummy_webhook.com',
                active: false,
                auth_type: 'no_auth',
                username: 'Jon',
                rate_limit: 100,
                rate_limit_period: 1
              }
            }
          }
        end

        run_test! do |response|
          webhook_response = JSON.parse(response.body)['data']
          expect(webhook_response).to have_key('id')
          expect(webhook_response).to have_attribute(:url).with_value('http://www.dummy_webhook.com')
          expect(webhook_response).to have_attribute(:description).with_value('webhook description')
          expect(webhook_response).to have_attribute(:active).with_value(false)
          expect(webhook_response).to have_attribute(:auth_type).with_value('no_auth')
          expect(webhook_response).to have_attribute(:username).with_value('Jon')
        end
      end
    end
  end

  path '/projects/{project_id}/webhooks/{webhook_id}/' do
    patch 'Update a Webhook' do
      operationId 'UpdateWebhook'
      description 'Update a webhook'
      tags 'Webhooks'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :webhook_id, in: :path, type: :string
      parameter name: :project_id, in: :path, type: :string
      parameter name: :body,
                in: :body,
                schema: { '$ref' => '#/components/schemas/WebhookUpdateRequest' },
                required: true

      response '200', 'Webhook Updated' do
        schema '$ref' => '#/components/schemas/WebhookResponse'
        examples 'application/json' => {
          data: {
            type: 'webhooks',
            id: '20',
            attributes: {
              acttive: true
            }
          }
        }

        let(:body) do
          {
            data: {
              type: 'webhooks',
              id: webhook.id.to_s,

              attributes: {
                description: 'webhook description',
                active: true,
                auth_type: 'no_auth',
                url: 'http://www.dummy_webhook_url.com'
              }
            }
          }
        end

        run_test! do |response|
          webhook_response = JSON.parse(response.body)['data']
          expect(webhook_response).to have_key('id')
          expect(webhook_response).to have_attribute(:description).with_value('webhook description')
          expect(webhook_response).to have_attribute(:url).with_value('http://www.dummy_webhook_url.com')
        end
      end
    end
  end
end
