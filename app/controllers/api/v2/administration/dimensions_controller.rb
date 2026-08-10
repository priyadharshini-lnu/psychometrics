# frozen_string_literal: true

module Api
  class V2::Administration::DimensionsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction

    def copy
      audit! :copy, resource, payload: { source_id: resource.id }
      copied_dimension = resource.clone_and_save(user_id: current_user.id, skip_owner_validation: true)
      jsonapi_render json: copied_dimension
    end

    def export_json
      audit! :export_json, resource, payload: { source_id: resource.id }
      AdminJob.call(
        :export_dimension_as_json,
        { dimension_id: resource.id },
        current_user
      )

      render json: { status: 'scheduled' }
    end

    def export_translations
      audit! :export_translations, resource, payload: { source_id: resource.id }
      AdminJob.call(
        :export_factor_translations,
        { dimension_id: resource.id },
        current_user
      )

      render json: { status: 'scheduled' }
    end

    def import_translations
      if params[:file].present?
        audit! :import_translations, resource, payload: { source_id: resource.id }
        AdminJob.call(
          :import_factor_translations,
          { dimension_id: resource.id },
          current_user,
          params[:file]
        )

        render json: :ok
      else
        render json: { errors: [I18n.t('administration.errors.csv_file_required')] },
               status: :unprocessable_entity
      end
    end

    private

    def resource
      @resource ||= Api::Administration::DimensionPolicy::Scope.new(
        current_user,
        Dimension
      ).resolve.find(params[:dimension_id] || params[:id])
    end
  end
end
