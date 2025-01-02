# frozen_string_literal: true

# rubocop:disable Style/MutableConstant
# rubocop:disable Metrics/ModuleLength

module Swagger
  module V1
    DEFINITION = {
      swagger: '2.0',
      info: {
        title: 'MTE Lighthouse API',
        version: '1.0.0',
        'x-logo': {
          url: 'https://static.tte-lighthouse.com/brand/lighthouse/TTE_Lighthouse_Logo.svg',
          backgroundColor: '#FFFFFF',
          altText: 'Lighthouse'
        },
        contact: {
          name: 'MTE Support',
          email: 'mte.support@mercer.com',
          url: 'https://thetalententerprise.com'
        },
        termsOfService: 'https://thetalententerprise.com/privacy-statement/',
        description:
        <<~DESCRIPTION
          ## Introduction
          Lighthouse REST API enables developers to integrate Lighthouse with other services such as Applicant Tracking Systems, ERP, Performance Management Systems etc. Which means you control the entire hiring or development process within your own/third-party system, with candidate results available to your system as soon as the candidate completes the assessment.

          To access the Lighthouse REST API, you will need to obtain the API Key and Token. Contact Mercer Talent Enterprise for more information about getting started.

          ## Base URL
          All URLs referenced in this documentation have the following base component.

          `https://%<host>s%<basePath>s`

          To ensure data privacy and security, all requests should be made over `https`. `http` is not supported.

          ## Authentication
          Basic Auth is used to make API calls. Use the **API Key** as the Username and **Token** as the password.

          ## Single Sign-On
          Single Sign-On (SSO) is a feature that allows users to access multiple applications with one set of login credentials.

          There are 3 ways to use SSO feature.

          ### SAML 2.0
          Lighthouse supports SAML 2.0 for SSO. Please contact your TTE Project Manager to configure your Identity Provider (IdP).

          ### SSO URLs using REST API
          The Lighthouse API provides a way to generate SSO URLs using the REST API. The SSO URL can be used to authenticate users and redirect them to the participant dashboard.

          ### JWT
          You can pass JWT token to any of the Lighthouse Participant portal URLs to authenticate the user. The JWT token should be passed as a query parameter `jwt`.

          Example:
          ```
          https://<subdomain>.tte-lighthouse.com/?jwt=<jwt_token>
          ```
          The JWT token should be signed with the API Token provided by TTE. API Token is also used as a password for Basic Authentication for the APIs.

          Following are the claims that should be present in the payload:
          - `sub`: User's email address or User ID
          - `exp`: Expiry time of the token

          Following are the claims that should be present in the header:
          - `alg`: Use `HS256`
          - `api_key`: API Key provided by TTE

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
      security: [
        {
          basic: []
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
            description: { type: 'string', 'x-nullable': true },
            icon_url: { type: 'string', 'x-nullable': true },
            poster_url: { type: 'string', 'x-nullable': true },
            campaign_id: { type: 'integer' },
            status: { type: 'string', enum: %w[not_started in_progress completed] },
            started_at: { type: 'string', 'x-nullable': true },
            completed_at: { type: 'string', 'x-nullable': true }
          }
        },
        UserReport: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string', 'x-nullable': true },
            icon_url: { type: 'string', 'x-nullable': true },
            poster_url: { type: 'string', 'x-nullable': true },
            user_access: { type: 'boolean' },
            output_type: {
              type: 'object',
              properties: {
                pdf: { type: 'boolean' },
                results: { type: 'boolean' }
              }
            },
            campaign_id: { type: 'integer' },
            status: { type: 'string', enum: %w[not_ready generating failed ready] },
            assessments: { type: 'array', items: { '$ref' => '#/definitions/UserAssessment' } }
          }
        },
        ReportPdf: {
          type: 'object',
          properties: {
            url: { type: 'string', 'x-nullable': true },
            campaign_id: { type: 'integer' },
            status: { type: 'string' }
          }
        },
        NewUser: {
          type: 'object',
          properties: {
            first_name: { type: 'string', 'x-nullable': true },
            last_name: { type: 'string', 'x-nullable': true },
            email: { type: 'string' },
            campaign_ids: {
              type: 'array',
              items: { type: 'integer' },
              'x-nullable': true,
              description: 'deprecated, use "campaigns". In case both "campaigns"  and "campaign_ids" are provided
, "campaigns" will be used'
            },
            campaigns: { type: 'array', items: { '$ref' => '#/definitions/NewUserCampaign' }, 'x-nullable': true },
            existing_record: {
              type: 'string',
              enum: %w[reject accept],
              default: 'reject',
              description: '**reject**: This will return an error if the user already exists.
              **accept**: This will update the user if existing record is found.
              '
            }
          },
          required: %w[email first_name last_name campaign_ids]
        },
        GetUser: {
          type: 'object',
          items: {
            first_name: { type: 'string', 'x-nullable': true },
            last_name: { type: 'string', 'x-nullable': true },
            email: { type: 'string' },
            campaign_ids: {
              type: 'array',
              items: { type: 'integer' },
              'x-nullable': true,
              description: 'deprecated, use "campaigns". In case both "campaigns"  and "campaign_ids" are provided
, "campaigns" will be used'
            },
            campaigns: { type: 'array', items: { '$ref' => '#/definitions/NewUserCampaign' }, 'x-nullable': true }
          },
          required: %w[email first_name last_name campaign_ids]
        },
        UpdatedUser: {
          type: 'object',
          properties: {
            first_name: { type: 'string', 'x-nullable': true },
            last_name: { type: 'string', 'x-nullable': true },
            email: { type: 'string', 'x-nullable': true },
            campaigns: { type: 'array', items: { '$ref' => '#/definitions/NewUserCampaign' }, 'x-nullable': true }
          }
        },
        ReportResults: {
          type: 'object',
          properties: {
            campaign_id: { type: 'integer' },
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
            raw_factors: { type: 'array', items: { '$ref' => '#/definitions/RawFactor' }, 'x-nullable': true },
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
        RawFactor: {
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
        NewUserCampaigns: {
          type: 'object',
          properties: {
            campaign_ids: {
              type: 'array',
              items: { type: 'integer' },
              'x-nullable': true,
              description: 'deprecated, use "campaigns". In case both "campaigns"  and "campaign_ids" are provided
, "campaigns" will be used'
            },
            campaigns: { type: 'array', items: { '$ref' => '#/definitions/NewUserCampaign' }, 'x-nullable': true }
          }
        },
        NewUserCampaign: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            active: { type: 'boolean' },
            external_id: { type: 'string', 'x-nullable': true },
            existing_record: {
              type: 'string',
              enum: %w[copy_evaluation new_evaluation],
              description: '**copy_evaluation**: This will copy the responses if the user has previously
              completed the assessment in different a campaign. Most recent response will be used
              **new_evaluation**: This allows the user to sit an assessment even if the user has previously
              completed the assessment in a different campaign.
              '
            },
            schedule_start_date: {
              type: 'string',
              format: 'date-time',
              description: 'Start date and time for the campaign schedule',
              example: nil,
              nullable: true
            },
            schedule_end_date: {
              type: 'string',
              format: 'date-time',
              description: 'End date and time for the campaign schedule',
              example: nil,
              nullable: true
            }
          }
        },
        NewCampaign: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            status: { type: 'string', enum: %w[active inactive closed archived] },
            start_date: { type: 'string', 'x-nullable': true },
            end_date: { type: 'string', 'x-nullable': true },
            fixed_time: { type: 'boolean', 'x-nullable': true },
            duration: { type: 'integer', 'x-nullable': true },
            enable_instructions: { type: 'boolean', 'x-nullable': true },
            instructions: { type: 'string', 'x-nullable': true },
            description: { type: 'string', 'x-nullable': true }
          }
        },
        UpdatedCampaign: {
          type: 'object',
          properties: {
            name: { type: 'string', 'x-nullable': true },
            status: { type: 'string', enum: %w[active inactive closed archived], 'x-nullable': true },
            start_date: { type: 'string', 'x-nullable': true },
            end_date: { type: 'string', 'x-nullable': true },
            fixed_time: { type: 'boolean', 'x-nullable': true },
            duration: { type: 'integer', 'x-nullable': true },
            enable_instructions: { type: 'boolean', 'x-nullable': true },
            instructions: { type: 'string', 'x-nullable': true },
            description: { type: 'string', 'x-nullable': true }
          }
        },
        UpdatedCampaignUser: {
          type: 'object',
          properties: {
            schedule_start_date: {
              type: 'string',
              format: 'date-time',
              description: 'Start date and time for the campaign schedule',
              nullable: true
            },
            schedule_end_date: {
              type: 'string',
              format: 'date-time',
              description: 'End date and time for the campaign schedule',
              nullable: true
            }
          }
        },
        Campaign: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            status: { type: 'string', enum: %w[active inactive closed archived] },
            start_date: { type: 'string', 'x-nullable': true },
            end_date: { type: 'string', 'x-nullable': true },
            fixed_time: { type: 'boolean', 'x-nullable': true },
            duration: { type: 'integer', 'x-nullable': true },
            enable_instructions: { type: 'boolean', 'x-nullable': true },
            instructions: { type: 'string', 'x-nullable': true },
            created_at: { type: 'string', 'x-nullable': true },
            updated_at: { type: 'string', 'x-nullable': true },
            description: { type: 'string', 'x-nullable': true }
          }
        },
        UserCampaign: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            created_at: { type: 'string' },
            updated_at: { type: 'string' }
          }
        },
        UpdatedReport: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_access: { type: 'boolean' },
            report_bundle_id: { type: 'integer' }
          }
        },
        UpdatedAssessment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            norm_id: { type: 'integer', 'x-nullable': true }
          }
        },
        UpdatedCampaignAssessmentsAndReports: {
          type: 'object',
          properties: {
            reports: { type: 'array', items: { '$ref' => '#/definitions/UpdatedReport' } },
            assessments: { type: 'array', items: { '$ref' => '#/definitions/UpdatedAssessment' } }
          }
        },
        AssessmentsAndReports: {
          type: 'object',
          properties: {
            reports: { type: 'array', items: { '$ref' => '#/definitions/CampaignOrUserReport' } },
            assessments: { type: 'array', items: { '$ref' => '#/definitions/CampaignOrUserAssessment' } }
          }
        },
        CampaignOrUserReport: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_access: { type: 'boolean' },
            report_bundle_id: { type: 'integer' }
          }
        },
        CampaignOrUserAssessment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            norm_id: { type: 'integer', 'x-nullable': true }
          }
        },
        NewProject: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            subdomain: { type: 'string' },
            client_id: { type: 'integer' },
            client_reference: { type: 'string', 'x-nullable': true },
            locales: { type: 'array', items: { type: 'string', enum: Settings.enduser_locales }, 'x-nullable': true },
            data_processing_consent: { type: 'boolean' },
            enable_strong_password: { type: 'boolean', 'x-nullable': true },
            enable_2factor_auth: { type: 'boolean', 'x-nullable': true },
            project_logo: { type: 'string', 'x-nullable': true },
            partner_logo: { type: 'string', 'x-nullable': true },
            webhook: { type: 'string', 'x-nullable': true },
            background_image: { type: 'string', 'x-nullable': true },
            background_color: { type: 'string', 'x-nullable': true },
            login_box_position: { type: 'string', 'x-nullable': true },
            logo_alt_text: {
              type: 'string',
              maxLength: 100,
              pattern: "^[a-zA-Z0-9\\s\\-.,()&']+$",
              'x-nullable': true
            },
            secondary_logo_alt_text: {
              type: 'string',
              maxLength: 100,
              pattern: "^[a-zA-Z0-9\\s\\-.,()&']+$",
              'x-nullable': true
            }
          }
        },
        UpdatedProject: {
          type: 'object',
          properties: {
            name: { type: 'string', 'x-nullable': true },
            subdomain: { type: 'string', 'x-nullable': true },
            client_reference: { type: 'string', 'x-nullable': true },
            locales: { type: 'array', items: { type: 'string', enum: Settings.enduser_locales }, 'x-nullable': true },
            data_processing_consent: { type: 'boolean', 'x-nullable': true },
            enable_strong_password: { type: 'boolean', 'x-nullable': true },
            enable_2factor_auth: { type: 'boolean', 'x-nullable': true },
            project_logo: { type: 'string', 'x-nullable': true },
            partner_logo: { type: 'string', 'x-nullable': true },
            background_image: { type: 'string', 'x-nullable': true },
            background_color: { type: 'string', 'x-nullable': true },
            webhook: { type: 'string', 'x-nullable': true },
            login_box_position: { type: 'string', 'x-nullable': true },
            logo_alt_text: {
              type: 'string',
              'x-nullable': true,
              maxLength: 100,
              pattern: "^[a-zA-Z0-9\\s\\-.,()&']+$"
            },
            secondary_logo_alt_text: {
              type: 'string',
              'x-nullable': true,
              maxLength: 100,
              pattern: "^[a-zA-Z0-9\\s\\-.,()&']+$"
            }
          }
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            client_id: { type: 'integer' },
            name: { type: 'string' },
            subdomain: { type: 'string' },
            client_reference: { type: 'string', 'x-nullable': true },
            locales: { type: 'array', items: { type: 'string' } },
            enable_strong_password: { type: 'boolean', 'x-nullable': true },
            enable_2factor_auth: { type: 'boolean', 'x-nullable': true },

            project_logo: { type: 'string', 'x-nullable': true },
            partner_logo: { type: 'string', 'x-nullable': true },
            background_image: { type: 'string', 'x-nullable': true },
            background_color: { type: 'string', 'x-nullable': true },
            login_box_position: { type: 'string', 'x-nullable': true },
            logo_alt_text: {
              type: 'string',
              'x-nullable': true,
              maxLength: 100,
              pattern: "^[a-zA-Z0-9\\s\\-.,()&']+$"
            },
            secondary_logo_alt_text: {
              type: 'string',
              'x-nullable': true,
              maxLength: 100,
              pattern: "^[a-zA-Z0-9\\s\\-.,()&']+$"
            },
            webhook: { type: 'string', 'x-nullable': true },
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
            campaigns: { type: 'array', items: { '$ref': '#/definitions/UserCampaign' } },
            campaign_ids: {
              type: 'array',
              items: { type: 'integer' },
              'x-nullable': true,
              description: 'deprecated, use "campaigns". In case both "campaigns"  and "campaign_ids" are provided
, "campaigns" will be used'
            },
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
            campaign_id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string', 'x-nullable': true },
            icon_url: { type: 'string', 'x-nullable': true },
            poster_url: { type: 'string', 'x-nullable': true },
            url: { type: 'string' },
            status: { type: 'string', enum: %w[not_started in_progress completed] }
          }
        },
        CampaignUserResults: {
          type: 'object',
          properties: {
            finalized: { type: 'boolean' },
            finalized_at: { type: 'string', 'x-nullable': true },
            calculated_at: { type: 'string', 'x-nullable': true },
            results: {
              type: 'array',
              items: {
                type: 'object'
              }
            }
          },
          example: {
            finalized: true,
            finalized_at: '2019-03-04T15:47:33.570+04:00',
            last_calculated_at: '2019-03-04T15:47:33.570+04:00',
            results: [
              {
                id: 'competency_a',
                name: 'Competency A',
                value: 2.0,
                value_type: 'numeric'
              },
              {
                id: 'competency_b',
                name: 'Competency B',
                value: 3.0,
                value_type: 'numeric'
              },
              {
                id: 'overall_score',
                name: 'Overall Score',
                value: 2.5,
                value_type: 'numeric'
              },
              {
                id: 'overall_category',
                name: 'Overall Category',
                value: 'Moderate',
                value_type: 'string'
              }
            ]
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
  end
end

# rubocop:enable Style/MutableConstant
# rubocop:enable Metrics/ModuleLength
