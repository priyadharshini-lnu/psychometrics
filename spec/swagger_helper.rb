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
        title: 'TTE Lighthouse API',
        version: 'v1',
        'x-logo': {
          url: 'https://tte-static.s3.amazonaws.com/brand/lighthouse/TTE_Lighthouse_Logo.svg',
          backgroundColor: '#FFFFFF',
          altText: 'Lighthouse'
        },
        description: "## Introduction\nLighthouse REST API enables TTE customers to integrate Lighthouse with their portal.\n## API Integration\nLighthouse can be integrated with many environments and programming languages via our REST API.\n\n## Authentication\nBasic Auth is used to authenticate on behalf of the Client Admin. \n\n## User Single Sign-on\nSingle Sign-on is achieved via calling the sso endpoint and redirecting the user to the URL returned in the response."
      },
      securityDefinitions: { basic: { type: :basic } },
      paths: {},
      security: [
        {
          "basic": []
        }
      ],
      basePath: "/api/v1",
      schemes: [
        "https"
      ],
      consumes: [
        "application/json"
      ],
      produces: [
        "application/json"
      ],
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
        UserReport: {
          type: 'object',
          properties: {
            id: { type: 'integer'},
            name: { type: 'string' },
            status: { type: 'string'},
            asessments: { type: 'array', items: { '$ref' => '#/definitions/UserAssessment' } }
          }
        },
        ReportPdf: {
          type: 'object',
          properties: {
            url: { type: 'string', 'x-nullable': true },
            status: { type: 'string' },
          }
        },
        NewUser: {
          type: 'object',
          properties: {
            first_name: { type: 'string', 'x-nullable': true },
            last_name: { type: 'string', 'x-nullable': true },
            email: { type: 'string' },
            campaign_ids: { type: 'array', items: { type: 'integer' }, 'x-nullable': true },
          },
          required: ['email', 'first_name', 'last_name', 'campaign_ids']
        },
        UpdatedUser: {
          type: 'object',
          properties: {
            first_name: { type: 'string', 'x-nullable': true },
            last_name: { type: 'string', 'x-nullable': true },
            email: { type: 'string', 'x-nullable': true },
          }
        },
        ReportResults: {
          type: 'object',
          properties: {
            user_data: { type: 'object', 'x-nullable': true },
            assessments: { type: 'array', items: { '$ref' => '#/definitions/ResultAssessment' } }
          }
        },
        ResultAssessment: {
          type: 'object',
          properties: {
            id: { type: 'integer', 'x-nullable': true },
            name: { type: 'string', 'x-nullable': true },
            results: { '$ref' => '#/definitions/ResultAssessmentResults', 'x-nullable': true },
          }
        },
        ResultAssessmentResults: {
          type: 'object',
          properties: {
            normed_factors: { type: 'array', items: { '$ref' => '#/definitions/NormedFactor' }, 'x-nullable': true },
            ranked_occupations: { type: 'array', items: { '$ref' => '#/definitions/RankedOccupation' }, 'x-nullable': true },
          }
        },
        NormedFactor: {
          type: 'object',
          properties: {
            key: { type: 'string', 'x-nullable': true },
            name: { type: 'string', 'x-nullable': true },
            value: { type: 'string', 'x-nullable': true },
          }
        },
        RankedOccupation: {
          type: 'object',
          properties: {
            key: { type: 'string', 'x-nullable': true },
            name: { type: 'string', 'x-nullable': true },
            rank: { type: 'integer', 'x-nullable': true },
            normed_factors: { type: 'array', items: { '$ref' => '#/definitions/NormedFactor' }, 'x-nullable': true },
          }
        },
        DuplicatedCampaign: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          }
        },
        NewCampaigns: {
          type: 'object',
          properties: {
            campaign_ids: { type: 'array', items: { type: 'integer' } },
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
        },
        SsoUrl: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            expires_at: { type: 'string' },
            assessments: { type: 'array', items: { '$ref' => '#/definitions/AssessmentSsoUrl' } }
          }
        },
        AssessmentSsoUrl: {
          type: 'object',
          properties: {
            id: { type: 'integer'},
            name: { type: 'string' },
            url: { type: 'string' },
          }
        }
      }
    }
  }
end
