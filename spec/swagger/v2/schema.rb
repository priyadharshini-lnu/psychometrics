# frozen_string_literal: true

# rubocop:disable Style/MutableConstant

Dir[__dir__ + '/definitions/**/*.rb'].sort.each { |file| require file }

module Swagger
  module V2
    DEFINITION = {
      openapi: '3.0.1',
      info: {
        title: 'TTE Lighthouse API 2.0',
        version: '2.0.0',
        'x-logo': {
          url: 'https://static.tte-lighthouse.com/brand/lighthouse/TTE_Lighthouse_Logo.svg',
          backgroundColor: '#FFFFFF',
          altText: 'Lighthouse'
        },
        contact: {
          name: 'TTE Support',
          email: 'support@thetalententerprise.com',
          url: 'https://thetalententerprise.com'
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

          <img src="https://static.tte-lighthouse.com/lighthouse/Lighthouse-Typical-Integration.svg" style="width: 100%%;"/>

          ## Terminology

          ### Assessments
          Assessments are pre-configured for a campaign. Any user added to the campaign gets assigned the configured assessments.

          ### Campaigns
          Campaigns can be pre-configured with default assessments and reports. This is a way to group users by specific use case. For recruitment, a Campaign could mean a position.

          ### Results
          After the user sits the required assessments, a third-party system can periodically poll the results endpoint for competency scores and a PDF Report.

          ### Data Schema
          While designing the parsers for the API responses and webhook results, the possibility of new properties being introduced to objects at any level should be considered with the ongoing updates of the Lighthouse APIs.

          New attributes could also be added to the request schema but would be optional.
        DESCRIPTION
      },
      securityDefinitions: { basic: { type: :basic } },
      paths: {},
      security: {},
      basePath: '/api/v2/administration',
      servers: [{
        url: 'https://ttedev.me:3030'
      }],
      schemes: %w[http https],
      consumes: [
        'application/json'
      ],
      produces: [
        'application/json'
      ],
      components: {
        schemas: {
          ApiError: {
            type: 'object',
            properties: {
              code: { type: 'integer' },
              message: { type: 'string' },
              more_info: { type: 'string', 'x-nullable': true }
            }
          },
          ClientsListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::Client::Schema.multiple_resource_response, description: 'Client'
          )
        }
      }
    }
  end
end

# rubocop:enable Style/MutableConstant
