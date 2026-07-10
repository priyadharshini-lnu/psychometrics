# frozen_string_literal: true

module Api
  class V2::Administration::DataReportsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction

    validates_request_schema :create, :create_contract_based_on_report_type
    validates_request_schema :update, :update_contract_based_on_report_type

    REPORT_TYPE_CONTRACTS = {
      'json_data_report' => Api::V2::DataReport::JsonDataReportContract,
      'user_reports_export' => Api::V2::DataReport::UserReportsContract,
      'report_usage_summary' => Api::V2::DataReport::ReportUsageSummaryContract,
      'hogan_usage_report' => Api::V2::DataReport::HoganUsageReportContract,
      'saville_usage_report' => Api::V2::DataReport::SavilleUsageReportContract,
      'user_created_dates' => Api::V2::DataReport::UserCreatedDatesExportContract,
      'pearson_usage_report' => Api::V2::DataReport::PearsonUsageReportContract,
      'client_assessment_counts' => Api::V2::DataReport::ClientAssessmentCountsContract,
      'active_clients_projects' => Api::V2::DataReport::ActiveClientsProjectsContract,
      'user_access_review' => Api::V2::DataReport::UserAccessReviewContract,
      'campaign_factor_scores' => Api::V2::DataReport::CampaignFactorScoresContract
    }.freeze

    def create_contract_based_on_report_type
      report_type = params.dig(:data, :attributes, :report_type)
      contract_class = REPORT_TYPE_CONTRACTS[report_type] || Api::V2::DataReport::Contract
      contract_class.new(schema: Api::V2::DataReport::Schema.create_request)
    end

    def update_contract_based_on_report_type
      report_type = params.dig(:data, :attributes, :report_type) || model&.report_type
      contract_class = REPORT_TYPE_CONTRACTS[report_type] || Api::V2::DataReport::Contract
      contract_class.new(schema: Api::V2::DataReport::Schema.update_request)
    end

    def run
      AdminJob.call(:data_report_export, { data_report_id: model.id, client_id: model.owner_id }, current_user)

      render json: :ok
    end

    def search_project
      projects =
        if params[:client_id].present?
          Client.find(params[:client_id]).projects
        else
          Project
        end

      if params[:filter].present?
        projects = projects.ransack(params[:filter]).result
      end

      render json: projects.order(:name).limit(20).select(:id, :name)
    end

    def pundit_authorize
      authorize(
        model,
        nil,
        policy_class: Api::Administration::DataReportPolicy,
        project_id: model&.owner_id || params.dig(:filter, :owner_id_eq)
      )
    end
  end
end
