require 'rails_helper'

RSpec.configure do |config|
  # Specify a root folder where Swagger JSON files are generated
  # NOTE: If you're using the rswag-api to serve API descriptions, you'll need
  # to ensure that it's configured to serve Swagger from the same folder
  config.swagger_root = Rails.root.to_s + '/swagger'

  # Define one or more Swagger documents and provide global metadata for each one
  # When you run the 'rswag:specs:to_swagger' rake task, the complete Swagger will
  # be generated at the provided relative path under swagger_root
  # By default, the operations defined in spec files are added to the first
  # document below. You can override this behavior by adding a swagger_doc tag to the
  # the root example_group in your specs, e.g. describe '...', swagger_doc: 'v2/swagger.json'
  config.swagger_docs = {
    'v1/swagger.json' => {
      swagger: '2.0',
      info: {
        title: 'API V1',
        version: 'v1'
      },
      securityDefinitions: { apiKey: { type: :apiKey, name: :'X-Api-Key', in: :header } },
      paths: {},
      definitions: {
        UserAssessment: {
          type: 'object',
          properties: {
            id: { type: 'integer'},
            name: { type: 'string' },
            status: { type: 'string'},
            started_at: { type: 'string', 'x-nullable': true },
            completed_at: { type: 'string', 'x-nullable': true }
          }
        },
        NewUser: {
          type: 'object',
          properties: {
            first_name: { type: 'string', 'x-nullable': true },
            last_name: { type: 'string', 'x-nullable': true },
            email: { type: 'string', required: true },
            campaign_ids: { type: 'array', items: { type: 'integer' }, 'x-nullable': true },
          }
        },
        UpdatedUser: {
          type: 'object',
          properties: {
            first_name: { type: 'string', 'x-nullable': true },
            last_name: { type: 'string', 'x-nullable': true },
            email: { type: 'string', 'x-nullable': true },
          }
        },
        Campaign: {
          type: 'object',
          properties: {
            id: { type: 'integer'},
            name: { type: 'string' },
            created_at: { type: 'string'},
            updated_at: { type: 'string'}
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer'},
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            email: { type: 'string' },
            campaign_ids: { type: 'array', items: { type: 'integer' } },
            created_at: { type: 'string'},
            updated_at: { type: 'string'}
          }
        }
      }
    }
  }
end
