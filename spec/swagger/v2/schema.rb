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
          OKResponse: { type: 'string', example: 'ok', enum: ['ok'] },
          ChangePasswordRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::User::Schema.change_password_request
          ),
          ChangePasswordResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::User::Schema.change_password_response
          ),
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
          AssessmentsListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::Assessment::Schema.multiple_resource_response
          ),
          ApiKeyListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::ApiKey::Schema.multiple_resource_response
          ),
          ApiKeyResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::ApiKey::Schema.single_resource_response
          ),
          ApiKeyCreateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::ApiKey::Schema.create_request
          ),
          ApiKeyUpdateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::ApiKey::Schema.update_request
          ),
          AssessmentResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::Assessment::Schema.single_resource_response
          ),
          ReportResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::Report::Schema.single_resource_response
          ),
          ReportFamilyResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::ReportFamily::Schema.single_resource_response
          ),
          ReportFamiliesReportResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::ReportFamiliesReport::Schema.single_resource_response
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
          LicensesListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::License::Schema.multiple_resource_response
          ),
          LicenseResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::License::Schema.single_resource_response
          ),
          LicenseCreateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::License::Schema.create_request
          ),
          LicenseUpdateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::License::Schema.update_request
          ),
          LicenseUsageListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::LicenseUsage::Schema.multiple_resource_response
          ),
          LicenseUsageResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::LicenseUsage::Schema.single_resource_response
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
          ExternalReportListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::ExternalReport::Schema.multiple_resource_response
          ),
          ReportFamilyListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::ReportFamily::Schema.multiple_resource_response
          ),
          ReportFamiliesReportListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::ReportFamiliesReport::Schema.multiple_resource_response
          ),
          UserListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::User::Schema.multiple_resource_response
          ),
          UserResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::User::Schema.single_resource_response
          ),
          UserUpdateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::User::Schema.update_request
          ),
          UserCreateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::User::Schema.create_request
          ),
          AssessorScoresResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::User::Schema.assessors_scores_response
          ),
          MembershipListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::Membership::Schema.multiple_resource_response
          ),
          MembershipResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::Membership::Schema.single_resource_response
          ),
          MembershipCreateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::Membership::Schema.create_request
          ),
          MembershipUpdateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::Membership::Schema.update_request
          ),
          AdminRolesListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::AdminRole::Schema.multiple_resource_response
          ),
          AdminRoleResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::AdminRole::Schema.single_resource_response
          ),
          AdminRoleCreateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::AdminRole::Schema.create_request
          ),
          AdminRoleUpdateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::AdminRole::Schema.update_request
          ),
          ResetPasswordRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::User::Schema.reset_password_request
          ),
          ResetPasswordResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::User::Schema.reset_password_response
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
          ),
          PrivacySettingListRespose: Api::Base::GenerateSwagger.call!(
            Api::V2::PrivacySettings::Schema.multiple_resource_response
          ),
          PrivacySettingUpdateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::PrivacySettings::Schema.update_request
          ),
          WebhookResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::Webhook::Schema.single_resource_response
          ),
          WebhookCreateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::Webhook::Schema.create_request
          ),
          WebhookUpdateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::Webhook::Schema.update_request
          ),
          WebhookListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::Webhook::Schema.multiple_resource_response
          ),
          CampaignAssessorAssessmentListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::CampaignAssessorAssessment::Schema.multiple_resource_response
          ),
          CampaignAssessorAssessmentCreateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::CampaignAssessorAssessment::Schema.create_request
          ),
          CampaignAssessmentAssessorResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::CampaignAssessorAssessment::Schema.single_resource_response
          ),
          CampaignFactorGroupListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::CampaignFactorGroup::Schema.multiple_resource_response
          ),
          CampaignFactorGroupCreateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::CampaignFactorGroup::Schema.create_request
          ),
          CampaignFactorGroupResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::CampaignFactorGroup::Schema.single_resource_response
          ),
          CampaignFactorListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::CampaignFactor::Schema.multiple_resource_response
          ),
          CampaignFactorValuesResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::CampaignFactorValue::Schema.multiple_resource_response
          ),
          CampaignFactorValueUpdateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::CampaignFactorValue::Schema.save_assessor_scoring_factor_value_request
          ),
          CampaignFactorCreateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::CampaignFactor::Schema.create_request
          ),
          CampaignFactorResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::CampaignFactor::Schema.single_resource_response
          ),
          WorkshopResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::Workshop::Schema.single_resource_response
          ),
          WorkshopInviteResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::WorkshopInvite::Schema.single_resource_response
          ),
          WorkshopInviteListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::WorkshopInvite::Schema.multiple_resource_response
          ),
          WorkshopInviteCreateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::WorkshopInvite::Schema.create_request
          ),
          WorkshopsListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::Workshop::Schema.multiple_resource_response
          ),
          WorkshopFacilitatorsResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::WorkshopFacilitator::Schema.multiple_resource_response
          ),
          WorkshopSubjectsListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::WorkshopSubject::Schema.multiple_resource_response
          ),
          AssessorWorkshopsResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::Assessors::Workshop::Schema.multiple_resource_response
          ),
          WorkshopBulkUpdateSubjectsRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::Workshop::Schema.bulk_update_subjects
          ),
          WorkshopSubjectsUpdateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::WorkshopSubject::Schema.update_request
          ),
          WorkshopResourcesListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::WorkshopResource::Schema.multiple_resource_response
          ),
          WorkshopResourcesCreateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::WorkshopResource::Schema.create_request
          ),
          WorkshopResourcesUpdateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::WorkshopResource::Schema.update_request
          ),
          UserAvailabilityDateResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::UserAvailabilityDate::Schema.single_resource_response
          ),
          UserAvailabilityDatesListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::UserAvailabilityDate::Schema.multiple_resource_response
          ),
          UserAvailabilityDateCreateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::UserAvailabilityDate::Schema.create_request
          ),
          UserAvailabilityDateUpdateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::UserAvailabilityDate::Schema.update_request
          ),
          WorkshopInvitedSubjectResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::WorkshopInvitedSubject::Schema.single_resource_response
          ),
          WorkshopInvitedSubjectListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::WorkshopInvitedSubject::Schema.multiple_resource_response
          ),
          WorkshopInvitedSubjectCreateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::WorkshopInvitedSubject::Schema.create_request
          ),
          CampaignAssessmentsListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::CampaignAssessment::Schema.multiple_resource_response
          ),
          UserAssessmentsListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::UserAssessment::Schema.multiple_resource_response
          ),
          WorkshopUpdateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::Workshop::Schema.update_request
          ),
          CampaignUserResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::CampaignUser::Schema.single_resource_response
          ),
          CampaignUserListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::CampaignUser::Schema.multiple_resource_response
          ),
          CampaignUserScoringsChangeFinalizeRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::CampaignUser::Schema.campaign_user_scorings_change_finalize_request
          ),
          CampaignUserScoringsChangeFinalizeBulkRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::CampaignUser::Schema.campaign_user_scorings_change_finalize_bulk_request
          ),
          CampaignUserScoringsRescoreBulkRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::CampaignUser::Schema.rescore_bulk_request
          ),
          CampaignAssessorAssessmentFactorWeightListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::CampaignAssessorAssessmentFactorWeight::Schema.multiple_resource_response
          ),
          CampaignAssessorAssessmentFactorWeightBulkUpsertRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::CampaignAssessorAssessmentFactorWeight::Schema.bulk_upsert(only_float_weight: true)
          ),
          DimensionListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::Dimension::Schema.multiple_resource_response
          ),
          FactorListResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::Factor::Schema.multiple_resource_response
          ),
          CampaignScoringVariableResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::CampaignScoringVariable::Schema.multiple_resource_response
          ),
          CampaignScoringVariableSingleResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::CampaignScoringVariable::Schema.single_resource_response
          ),
          CampaignScoringVariableUpdateRequest: Api::Base::GenerateSwagger.call!(
            Api::V2::CampaignScoringVariable::Schema.update_request
          ),
          ThreesixtyCampaignSingleResponse: Api::Base::GenerateSwagger.call!(
            Api::V2::ThreesixtyCampaign::Schema.single_resource_response
          )
        }
      }
    }
  end
end

# rubocop:enable all
