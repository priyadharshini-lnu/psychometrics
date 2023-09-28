# frozen_string_literal: true

module Api
  class V2::Administration::ClientAuditlogExportSettingsController < Api::V2::Administration::BaseController
    def test_connection
      res = ClientAuditlogExportSettings::TestConnection.call(resource)
      if res[:ok]
        jsonapi_render json: resource
      else
        jsonapi_render_errors [{ code: res[:error] }], status: :unprocessable_entity
      end
    end

    # TODO(atanych): Eliminate that using singleton and `show` endpoint
    def create_or_get
      default_args = { destination_type: :s3 }
      settings = client.client_auditlog_export_setting || client.create_client_auditlog_export_setting(default_args)

      jsonapi_render json: settings
    end

    def resource
      @resource ||= Api::Administration::ClientAuditlogExportSettingPolicy::Scope.new(
        current_user, ClientAuditlogExportSetting
      ).resolve.find(params[:id])
    end

    def client
      @client ||= Api::Administration::ClientPolicy::Scope.new(
        current_user, Client
      ).resolve.find(params[:client_id])
    end
  end
end
