# frozen_string_literal: true

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
        version: '1.0.0',
        'x-logo': {
          url: 'https://tte-static.s3.amazonaws.com/brand/lighthouse/TTE_Lighthouse_Logo.svg',
          backgroundColor: '#FFFFFF',
          altText: 'Lighthouse'
        },
        contact: {
          name: 'TTE Support',
          email: 'info@thetalententerprise.com',
          url: 'https://www.thetalententerprise.com'
        },
        termsOfService: 'https://thetalententerprise.com/privacy-statement/',
        description:
        <<~DESCRIPTION
          ## Introduction
          Lighthouse REST API enables developers to integrate Lighthouse with other services such as Applicant Tracking Systems, ERP, Performance Management Systems etc. Which means you control the entire hiring or development process within your own/third-party system, with candidate results available to your system as soon as the candidate completes the assessment.

          To access the Lighthouse REST API, you will need to obtain the API Key and Token. Contact The Talent Enterprise for more information about getting started.

          ## Base URL
          All URLs referenced in this documentation have the following base component.

          `https://%<host>s%<basePath>s`

          To ensure data privacy and security, all requests should be made over `https`. `http` is not supported.

          ## Authentication
          Basic Auth is used to make API calls. Use the **API Key** as the Username and **Token** as the password.

          ## Workflow
          There is no particular workflow you need to follow. A typical workflow is shown below.

          <img src="https://tte-static.s3.amazonaws.com/lighthouse/Lighthouse-Typical-Integration.svg" style="width: 100%%;"/>

          ## Terminology

          ### Assessments
          Assessments are pre-configured for a campaign. Any user added to the campaign gets assigned the configured assessments.

          ### Campaigns
          Campaigns can be pre-configured with default assessments and reports. This is a way to group users by specific use case. For recruitment, a Campaign could mean a position.

          ### Results
          After the user sits the required assessments, a third-party system can periodically poll the results endpoint for competency scores and a PDF Report.
        DESCRIPTION
      },
      securityDefinitions: { basic: { type: :basic } },
      paths: {},
      security: [
        {
          "basic": []
        }
      ],
      basePath: '/api/v1',
      schemes: [
        'https'
      ],
      consumes: [
        'application/json'
      ],
      produces: [
        'application/json'
      ],
      definitions: {
        ApiError: {
          type: 'object',
          properties: {
            code: { type: 'integer' },
            message: { type: 'string' },
            more_info: { type: 'string', 'x-nullable': true }
          }
        },
        UserAssessment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            status: { type: 'string' },
            started_at: { type: 'string', 'x-nullable': true },
            completed_at: { type: 'string', 'x-nullable': true }
          }
        },
        UserReport: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            status: { type: 'string' },
            asessments: { type: 'array', items: { '$ref' => '#/definitions/UserAssessment' } }
          }
        },
        ReportPdf: {
          type: 'object',
          properties: {
            url: { type: 'string', 'x-nullable': true },
            status: { type: 'string' }
          }
        },
        NewUser: {
          type: 'object',
          properties: {
            first_name: { type: 'string', 'x-nullable': true },
            last_name: { type: 'string', 'x-nullable': true },
            email: { type: 'string' },
            campaign_ids: { type: 'array', items: { type: 'integer' }, 'x-nullable': true }
          },
          required: %w[email first_name last_name campaign_ids]
        },
        UpdatedUser: {
          type: 'object',
          properties: {
            first_name: { type: 'string', 'x-nullable': true },
            last_name: { type: 'string', 'x-nullable': true },
            email: { type: 'string', 'x-nullable': true }
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
            results: { '$ref' => '#/definitions/ResultAssessmentResults', 'x-nullable': true }
          }
        },
        ResultAssessmentResults: {
          type: 'object',
          properties: {
            normed_factors: { type: 'array', items: { '$ref' => '#/definitions/NormedFactor' }, 'x-nullable': true },
            ranked_occupations: { type: 'array', items: { '$ref' => '#/definitions/RankedOccupation' },
                                  'x-nullable': true }
          }
        },
        NormedFactor: {
          type: 'object',
          properties: {
            key: { type: 'string', 'x-nullable': true },
            name: { type: 'string', 'x-nullable': true },
            value: { type: 'string', 'x-nullable': true }
          }
        },
        RankedOccupation: {
          type: 'object',
          properties: {
            key: { type: 'string', 'x-nullable': true },
            name: { type: 'string', 'x-nullable': true },
            rank: { type: 'integer', 'x-nullable': true },
            normed_factors: { type: 'array', items: { '$ref' => '#/definitions/NormedFactor' }, 'x-nullable': true }
          }
        },
        DuplicatedCampaign: {
          type: 'object',
          properties: {
            name: { type: 'string' }
          }
        },
        NewCampaigns: {
          type: 'object',
          properties: {
            campaign_ids: { type: 'array', items: { type: 'integer' } }
          }
        },
        Campaign: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            created_at: { type: 'string' },
            updated_at: { type: 'string' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            email: { type: 'string' },
            campaign_ids: { type: 'array', items: { type: 'integer' } },
            created_at: { type: 'string' },
            updated_at: { type: 'string' }
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
            id: { type: 'integer' },
            name: { type: 'string' },
            url: { type: 'string' }
          }
        },
        Occupation: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            updated_at: { type: 'string' }
          }
        },
        Factor: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            updated_at: { type: 'string' }
          }
        },
        Dimension: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            occupations: {
              type: 'array',
              items: { '$ref' => '#/definitions/Occupation' }
            },
            factors: {
              type: 'array',
              items: { '$ref' => '#/definitions/Factor' }
            }
          }
        },
        Dimensions: {
          type: 'object',
          properties: {
            dimensions: {
              type: 'array',
              items: { '$ref' => '#/definitions/Dimension' }
            }
          }
        }
      }
    }
  }
end
