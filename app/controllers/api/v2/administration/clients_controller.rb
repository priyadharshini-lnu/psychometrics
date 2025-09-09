# frozen_string_literal: true

module Api
  class V2::Administration::ClientsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    validate_crud_requests Api::V2::Client::Schema

    def client_auditlog_export_setting
      default_args = { destination_type: :s3 }
      settings = resource.client_auditlog_export_setting || resource.create_client_auditlog_export_setting(default_args)

      jsonapi_render json: settings, options: { resource: Api::V2::Administration::ClientAuditlogExportSettingResource }
    end

    private

    def meta_details
      {
        countries: -> { ::Datas::Geo.order(:country_name).select(:country_name).distinct.pluck(:country_name) },
        types: -> { Client.types.keys }
      }
    end

    def resource
      @resource ||= Api::Administration::ClientPolicy::Scope.new(
        current_user, Client
      ).resolve.find(params[:client_id])
    end
  end
end
