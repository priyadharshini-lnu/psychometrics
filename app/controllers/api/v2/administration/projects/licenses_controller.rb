# frozen_string_literal: true

module Api
  module V2
    module Administration
      module Projects
        class LicensesController < Api::V2::Administration::BaseController
          skip_before_action :jsonapi_request_handling, only: %i[index]

          def index
            records = client.licenses.
                      includes(:report_family, :project_licenses).
                      left_joins(:project_licenses)
            records = if params[:filter]&.key?(:project_specific)
                        records.where(licenses: { is_project_specific: true })
                      else
                        records.where(
                          'licenses.is_project_specific = false OR project_licenses.project_id = ?', project.id
                        ).distinct
                      end

            if params[:filter]&.key?(:report_name)
              search_term = "%#{params[:filter][:report_name]}%"
              records = records.joins(:report_family).where('report_families.name ILIKE ?', search_term)
            end

            page_number = (params.dig(:page, :number) || 1).to_i
            page_size   = (params.dig(:page, :size)   || 25).to_i

            paginated = records.page(page_number).per(page_size)

            resources = paginated.map { |r| Api::V2::Administration::LicenseResource.new(r, context) }

            serializer = JSONAPI::ResourceSerializer.new(
              Api::V2::Administration::LicenseResource,
              include: %w[report_family project_license]
            )

            render json: serializer.serialize_to_hash(resources).merge(
              meta: {
                record_count: records.count,
                page_count: (records.count / page_size.to_f).ceil
              }
            )
          end

          def create
            form = ::Api::V2::Administration::Projects::LicenseForm.new(
              license_params.to_h.merge(project: project)
            )

            if (project_license = form.save)
              license = project_license.license

              render json: JSONAPI::ResourceSerializer.
                new(Api::V2::Administration::LicenseResource, include: %w[report_family project_license]).
                serialize_to_hash(
                  Api::V2::Administration::LicenseResource.new(license, context.merge(project: project))
                ), status: :created
            else
              render json: { errors: form.errors.full_messages.map do |msg|
                { detail: msg }
              end }, status: :unprocessable_entity
            end
          end

          def update
            form = ::Api::V2::Administration::Projects::LicenseForm.from_model(model)
            form.attributes = license_params.except(:license_id).to_h.merge(project_license: model)

            if form.save
              license = model.license

              render json: JSONAPI::ResourceSerializer.
                new(Api::V2::Administration::LicenseResource, include: %w[report_family project_license]).
                serialize_to_hash(
                  Api::V2::Administration::LicenseResource.new(license, context.merge(project: project))
                ),
                     status: :ok
            else
              render json: {
                errors: form.errors.full_messages.map { |msg| { detail: msg } }
              }, status: :unprocessable_entity
            end
          end

          def license_usages
            license_id = params[:id]
            project_id = params[:project_id]
            records = ::LicenseUsage.where(license_id: license_id, project_id: project_id)

            page_number = (params.dig(:page, :number) || 1).to_i
            page_size   = (params.dig(:page, :size)   || 25).to_i

            paginated = records.page(page_number).per(page_size)

            resources = paginated.map { |r| Api::V2::Administration::LicenseUsageResource.new(r, context) }

            serializer = JSONAPI::ResourceSerializer.new(
              Api::V2::Administration::LicenseUsageResource,
              include: %w[user status_updated_by]
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

          def model
            @model ||= ::ProjectLicense.find_by(id: params[:id]) || super
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

          def license_params
            params.require(:data).require(:attributes).permit(:usage_limit, :enabled, :license_id)
          end
        end
      end
    end
  end
end
