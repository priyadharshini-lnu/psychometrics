# frozen_string_literal: true

module Api
  class V2::Administration::ClientSsoSettingsController < Api::V2::Administration::BaseController
    validates_request_schema :update, -> { Api::V2::ClientSsoSettings::UpdateContract.new }
    validate_crud_requests Api::V2::ClientSsoSettings::Schema

    MAX_METADATA_SIZE = 1.megabyte

    def parse_metadata
      xml = params.require(:data).require(:attributes).require(:xml)

      if xml.bytesize > MAX_METADATA_SIZE
        return render json: { errors: [{ title: I18n.t('admin.sso_settings_metadata_file_too_large') }] },
                      status: :unprocessable_entity
      end

      SamlSettings::ParseMetaData.call(xml) do
        on(:ok) { |result| render json: result }
        on(:error) { |error| render json: { errors: [{ title: error }] }, status: :unprocessable_entity }
      end
    end
  end
end
