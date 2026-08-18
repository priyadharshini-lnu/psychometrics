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
      'campaign_factor_scores' => Api::V2::DataReport::CampaignFactorScoresContract,
      'campaign_user_creation' => Api::V2::DataReport::CampaignUserCreationContract,
      'proctoring_sessions' => Api::V2::DataReport::ProctoringSessionsContract
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
      runtime_configuration = parse_runtime_configuration
      return if performed?

      AdminJob.call(
        :data_report_export,
        {
          data_report_id: model.id,
          client_id: model.owner_id,
          runtime_configuration: runtime_configuration
        },
        current_user
      )

      audit!(
        'run',
        model,
        user: current_user,
        payload: {
          report_name: model.name,
          report_type: model.report_type
        }
      )

      render json: :ok
    end

    def search_project
      projects =
        if params[:client_id].present?
          Client.find(params[:client_id]).projects
        else
          Project
        end

      if params[:ids].present?
        projects = projects.ransack(id: params[:ids]).result
      elsif params[:filter].present?
        projects = projects.ransack(params[:filter]).result
      end

      render json: projects.order(:name).select(:id, :name)
    end

    def pundit_authorize
      authorize(
        model,
        nil,
        policy_class: Api::Administration::DataReportPolicy,
        project_id: model&.owner_id || params.dig(:filter, :owner_id_eq)
      )
    end

    private

    def parse_runtime_configuration
      raw = params.to_unsafe_h.dig('data', 'attributes', 'runtime_configuration')
      return {} if raw.blank?

      return invalid_runtime_configuration! unless raw.is_a?(Hash)

      unknown_keys = raw.keys - runtime_parameter_names
      return unknown_runtime_parameter_error!(unknown_keys) if unknown_keys.any?

      raw.slice(*runtime_parameter_names)
    end

    def runtime_parameter_names
      @runtime_parameter_names ||= begin
        handler_class = AdminJobs::DataReportExport::REPORT_TYPE_HANDLERS[model.report_type]
        handler_class.runtime_parameters.pluck(:name)
      end
    end

    def invalid_runtime_configuration!
      render_runtime_configuration_errors!([{ detail: I18n.t('admin.runtime_configuration_invalid_json_object') }])
    end

    def unknown_runtime_parameter_error!(unknown_keys)
      errors = unknown_keys.map do |key|
        {
          source: { pointer: key },
          detail: I18n.t('admin.runtime_configuration_invalid_parameter')
        }
      end

      render_runtime_configuration_errors!(errors)
    end

    def render_runtime_configuration_errors!(errors)
      render json: { errors: errors }, status: :unprocessable_entity
      nil
    end
  end
end
