# frozen_string_literal: true

module Api
  class V2::Administration::AssessmentsController < Api::V2::Administration::BaseController
    include Api::V2::Administration::Concerns::Taggable

    skip_before_action :enforce_geo_restriction

    validates_request_schema :create, :create_contract_based_on_assessment_type
    validates_request_schema :update, :update_contract_based_on_assessment_type
    validates_request_schema :copy, -> { Api::V2::Assessment::CopyContract.new }

    INTEGRATIONS_CONTRACTS = {
      'hogan' => Api::V2::Assessment::HoganContract,
      'pearson' => Api::V2::Assessment::PearsonContract,
      'iiht' => Api::V2::Assessment::IihtContract,
      'mettl' => Api::V2::Assessment::MettlContract,
      'saville' => Api::V2::Assessment::SavilleContract,
      'simulation' => Api::V2::Assessment::SimulationContract,
      'skillvue' => Api::V2::Assessment::SkillvueContract,
      'yoodli' => Api::V2::Assessment::YoodliContract,
      'mhs' => Api::V2::Assessment::MhsContract,
      'microsite' => Api::V2::Assessment::MicrositeContract
    }.freeze

    def create_contract_based_on_assessment_type
      integration_contract = INTEGRATIONS_CONTRACTS[params[:data][:attributes][:type]] ||
                             Api::V2::Assessment::CommonContract

      integration_contract.new(schema: Api::V2::Assessment::Schema.create_request)
    end

    def update_contract_based_on_assessment_type
      integration_contract = INTEGRATIONS_CONTRACTS[params[:data][:attributes][:type]] ||
                             Api::V2::Assessment::CommonContract
      integration_contract.new(schema: Api::V2::Assessment::Schema.update_request)
    end

    def toggle_archive
      resource.toggle!(:archived)
      audit! :toggle_archive, resource, payload: { archived: resource.archived }
      jsonapi_render json: resource
    end

    def fetch_translations
      locale = params[:locale]
      object = Mobility.with_locale(locale) do
        { name: resource.name, description: resource.description, timing: resource.timing, locale: locale }
      end

      render json: object
    end

    def update_translations
      attrs = params[:data][:attributes]
      locale = attrs[:locale]
      Mobility.with_locale(locale) do
        resource.update!(name: attrs[:name], description: attrs[:description], timing: attrs[:timing])
      end

      jsonapi_render json: resource
    end

    def copy
      audit! :copy, resource, payload: { source_id: resource.id }
      AdminJob.call(
        :copy_assessment,
        {
          assessment_id: resource.id,
          owner_id: params.dig(:data, :relationships, :owner, :data, :id),
          name: params.dig(:data, :attributes, :name),
          microsite_settings: microsite_copy_settings
        },
        current_user
      )
      render json: :ok
    end

    def restore
      audit! :restore, resource, payload: { source_id: resource.id }
      resource.restore!
      jsonapi_render json: resource
    end

    def export_raw_results
      AdminJob.call(
        :super_admin_assessment_raw_result_export,
        {
          assessment_id: params[:assessment_id].to_i,
          export_with_labels: params.dig(:data, :attributes, :with_labels)
        },
        current_user
      )

      jsonapi_render json: resource
    end

    def export_normed_results
      AdminJob.call(
        :super_admin_assessment_norm_export,
        { assessment_id: params[:assessment_id].to_i },
        current_user
      )

      jsonapi_render json: resource
    end

    def export_raw_factor_scores
      AdminJob.call(:super_admin_assessment_raw_factor_export, { assessment_id: params[:assessment_id].to_i },
                    current_user)

      jsonapi_render json: resource
    end

    def external_scores
      AdminJob.call(:super_admin_external_assessment_export, { assessment_id: params[:assessment_id].to_i },
                    current_user)

      jsonapi_render json: resource
    end

    def remove_cache
      resource.invalidate_cache
      audit! :remove_cache, resource, payload: { assessment_id: resource.id }
      jsonapi_render json: resource
    end

    private

    def microsite_copy_settings
      assessment_id = params.dig(:data, :attributes, :external_settings, :assessment_id)
      return if assessment_id.blank?

      {
        project_id: params.dig(:data, :relationships, :project, :data, :id),
        assessment_id: assessment_id
      }
    end

    def resource
      @resource ||= Api::Administration::AssessmentPolicy::Scope.new(
        current_user, Assessment
      ).resolve.find(params[:assessment_id])
    end
  end
end
