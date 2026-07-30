# frozen_string_literal: true

module Api
  class V2::Administration::ApplicationUrlWhitelistEntriesController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    validate_crud_requests Api::V2::ApplicationUrlWhitelistEntry::Schema
    validates_request_schema :bulk_create, -> { Api::V2::ApplicationUrlWhitelistEntry::Schema.bulk_create }

    def bulk_create
      result = ::Applications::UrlWhitelistEntries::BulkCreate.call(
        application_id: params[:application_id],
        entries: bulk_create_entries_params
      )

      if result[:ok]
        created_entries = result[:ok][:entries]

        created_entries.each do |entry|
          audit! :create, entry,
                 payload: entry.attributes.slice('id', 'url', 'description', 'enabled'),
                 client: entry.tenant
        end

        jsonapi_render json: created_entries
      else
        jsonapi_render_errors result[:error], status: :unprocessable_entity
      end
    end

    private

    def bulk_create_entries_params
      params.require(:data).require(:attributes).permit(entries: %i[url description]).fetch(:entries, [])
    end
  end
end
