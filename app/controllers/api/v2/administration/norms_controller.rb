# frozen_string_literal: true

module Api
  class V2::Administration::NormsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction

    validate_crud_requests Api::V2::Norm::Schema

    before_action :set_resource, only: %i[copy editor]

    def export
      AdminJob.call(
        :export_norm, { norm_id: params[:norm_id] }, current_user
      )

      render json: :ok
    end

    def import
      form = ::Administration::Norms::ImportForm.new(import_params)

      if form.valid?
        AdminJob.call(
          :import_norm, { owner_id: import_params[:owner_id] }, current_user, import_params[:file]
        )

        render json: :ok
      else
        render json: { errors: form.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def copy
      new_name = params.dig(:data, :attributes, :name)
      owner_id = params.dig(:data, :attributes, :owner_id)
      audit! :copy, @resource,
             payload: { source_id: @resource.id, new_name: new_name, owner_id: owner_id }
      result = ::Norms::CopyNorm.call!(
        norm: @resource,
        user: current_user,
        owner_id: owner_id,
        new_norm_name: new_name,
        skip_owner_validation: true
      )

      jsonapi_render json: result
    end

    def editor
      scope = Factor.includes(:translations).where(dimension_id: @resource.dimension_id).with_norm(
        @resource.id
      )

      structured_hash = FactorsNorm.structured_hash(scope)

      render json: structured_hash
    end

    private

    def set_resource
      @resource = Api::Administration::NormPolicy::Scope.new(
        current_user, Norm
      ).resolve.find(params[:norm_id])
    end

    def import_params
      params.permit(:owner_id, :file)
    end
  end
end
