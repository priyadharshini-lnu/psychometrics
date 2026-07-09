# frozen_string_literal: true

module Api
  class V2::Administration::Dimensions::OccupationConditionSetsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction

    validate_crud_requests Api::V2::Dimension::OccupationConditionSet::Schema

    def copy
      source = OccupationConditionSet.find(params[:id])
      authorize [:api, :administration, source]

      result = ::OccupationConditionSets::Copy.call(source, params.dig(:data, :attributes, :new_name))

      if result[:ok]
        jsonapi_render json: result[:ok]
      else
        render json: { errors: result[:error] }, status: 422
      end
    end
  end
end
