# frozen_string_literal: true

module Api
  module V2
    module Administration
      class FactorsNormsController < Api::V2::Administration::BaseController
        skip_before_action :enforce_geo_restriction
        validates_request_schema :update_cell, -> { Api::V2::FactorsNorm::UpdateContract.new }

        def update_cell
          factor_norm = ::FactorsNorm.change_cell(change_cell_params)
          if factor_norm.errors.any?
            render json: { errors: factor_norm.errors.full_messages }, status: :unprocessable_entity
          else
            render json: json_api_attributes(
              factor_norm,
              id: factor_norm.factor_id,
              norm_id: factor_norm.norm_id,
              props: factor_norm.props
            ), status: :ok
          end
        end

        def change_cell_params
          params.require(:data).require(:attributes).permit(
            :norm_id, :factor_id, :level, :field_name, :field_value
          )
        end
      end
    end
  end
end
