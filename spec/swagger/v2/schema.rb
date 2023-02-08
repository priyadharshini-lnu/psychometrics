# frozen_string_literal: true

# rubocop:disable Style/MutableConstant, Metrics/ModuleLength

Dir["#{__dir__}/definitions/**/*.rb"].each { |file| require file }

module Swagger
  module V2
    DEFINITION = {
      openapi: '3.0.1',
      info: {
        title: 'TTE Lighthouse API 2.0 Beta (Internal use only)',
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
          **Warning:** Version 2.0 API is unstable and subject to change without notice. Do not use this for integration.

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
            Api::V2::Client::Schema.multiple_resource_response
          ),
          ClientResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::Client::Schema.single_resource_response
          ),
          ClientCreateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::Client::Schema.create_request
          ),
          ClientUpdateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::Client::Schema.update_request
          ),
          DashboardsListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::Dashboard::Schema.multiple_resource_response
          ),
          DashboardResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::Dashboard::Schema.single_resource_response
          ),
          DashboardCreateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::Dashboard::Schema.create_request
          ),
          DashboardUpdateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::Dashboard::Schema.update_request
          ),
          DesignSettingListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::DesignSetting::Schema.multiple_resource_response
          ),
          DesignSettingUpdateResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::DesignSetting::Schema.single_resource_response
          ),
          ReportApprovalSettingListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::ReportApprovalSetting::Schema.multiple_resource_response
          ),
          ReportApprovalSettingCreateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::ReportApprovalSetting::Schema.create_request
          ),
          ReportApprovalSettingUpdateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::ReportApprovalSetting::Schema.update_request
          ),
          ReportApprovalSettingResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::ReportApprovalSetting::Schema.single_resource_response
          ),
          ReportListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::Report::Schema.multiple_resource_response
          ),
          UserListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::User::Schema.multiple_resource_response
          ),
          ReportApprovalListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::ReportApproval::Schema.multiple_resource_response
          ),
          UserReportCommentListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::UserReportComment::Schema.multiple_resource_response
          ),
          UserReportCommentCreateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::UserReportComment::Schema.create_request
          ),
          UserReportCommentUpdateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::UserReportComment::Schema.update_request
          ),
          UserReportCommentResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::UserReportComment::Schema.single_resource_response
          ),
          ProjectResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::Projects::Schema.single_resource_response
          ),
          ProjectCreateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::Projects::Schema.create_request
          ),
          ProjectUpdateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::Projects::Schema.update_request
          ),
          ProjectsListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::Projects::Schema.multiple_resource_response
          )
        }
      }
    }
  end
end

# rubocop:enable Style/MutableConstant, Metrics/ModuleLength
