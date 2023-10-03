# frozen_string_literal: true

module Api
  class V2::Administration::AssessmentsController < Api::V2::Administration::BaseController
    validates_request_schema :create, :create_contract_based_on_assessment_type
    validates_request_schema :update, :update_contract_based_on_assessment_type

    INTEGRATIONS_CONTRACTS = {
      'hogan' => Api::V2::Assessment::HoganContract,
      'pearson' => Api::V2::Assessment::PearsonContract,
      'iiht' => Api::V2::Assessment::IihtContract,
      'saville' => Api::V2::Assessment::SavilleContract
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
      result = ::Assessments::CopyAssessment.call!(resource.id, current_user)
      jsonapi_render json: result[:assessment]
    end

    def restore
      resource.restore!
      jsonapi_render json: resource
    end

    private

    def resource
      @resource ||= Api::Administration::AssessmentPolicy::Scope.new(
        current_user, Assessment
      ).resolve.find(params[:assessment_id])
    end
  end
end
