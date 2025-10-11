# frozen_string_literal: true

module Api
  module V2
    module Administration
      module Projects
        class LicensesController < Api::V2::Administration::BaseController
          skip_before_action :jsonapi_request_handling, only: [:index]

          def index
            records = client.licenses.
                      where(is_project_specific: true).
                      includes(:report_family)
            page_number = (params.dig(:page, :number) || 1).to_i
            page_size   = (params.dig(:page, :size)   || 25).to_i

            paginated = records.page(page_number).per(page_size)

            resources = paginated.map { |r| Api::V2::Administration::LicenseResource.new(r, context) }

            serializer = JSONAPI::ResourceSerializer.new(
              Api::V2::Administration::LicenseResource,
              include: ['report_family']
            )

            render json: serializer.serialize_to_hash(resources).merge(
              meta: {
                record_count: records.count,
                page_count: (records.count / page_size.to_f).ceil
              }
            )
          end

          def context
            super.merge(
              project: project,
              client: client
            )
          end

          private

          def project
            @project ||= Project.find(params[:project_id])
          end

          def client
            client_id = project&.ancestry
            return nil unless client_id

            @client ||= Api::Administration::ProjectPolicy::Scope.new(
              current_user, Client
            ).resolve.find(client_id)
          end
        end
      end
    end
  end
end
