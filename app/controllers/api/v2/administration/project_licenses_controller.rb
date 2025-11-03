# frozen_string_literal: true

module Api
  module V2
    module Administration
      class ProjectLicensesController < Api::V2::Administration::BaseController

        skip_before_action :jsonapi_request_handling, only: %i[create update]
        def create
          form = ::Api::V2::Administration::Projects::LicenseForm.new(
            license_params.to_h.merge(project: project)
          )
          if form.valid?
            project_license = ::Projects::Licenses::Create.call!(form, project)
            render_license(project_license.license, :created)
          else
            render_errors(form)
          end
        end

        def update
          form = ::Api::V2::Administration::Projects::LicenseForm.from_model(model)
          form.attributes = license_params.except(:license_id).to_h.merge(project_license: model)
          if form.valid?
            project_license = ::Projects::Licenses::Update.call!(form, model)
            render_license(project_license.license, :ok)
          else
            render_errors(form)
          end
        end

        def license_usages
          records = filtered_license_usages
          paginated = paginate(records)
          render json: serialize_resources(
            paginated,
            Api::V2::Administration::LicenseUsageResource,
            include: %w[user status_updated_by],
            total_count: records.count
          )
        end

        private

        def filtered_license_usages
          records = ::LicenseUsage.where(license_id: params[:id], project_id: params[:project_id])
          return records unless params.dig(:filter, :status_eq)

          records.where(status: params[:filter][:status_eq])
        end

        def paginate(scope)
          page_number = (params.dig(:page, :number) || 1).to_i
          page_size = (params.dig(:page, :size) || 25).to_i
          scope.page(page_number).per(page_size)
        end

        def serialize_resources(paginated, resource_class, include:, total_count:)
          resources = paginated.map { |r| resource_class.new(r, context) }
          serializer = JSONAPI::ResourceSerializer.new(resource_class, include: include)

          serializer.serialize_to_hash(resources).merge(
            meta: {
              record_count: total_count,
              page_count: (total_count / paginated.limit_value.to_f).ceil
            }
          )
        end

        def render_license(license, status)
          render json: JSONAPI::ResourceSerializer.
            new(Api::V2::Administration::LicenseResource, include: %w[report_family project_license]).
            serialize_to_hash(
              Api::V2::Administration::LicenseResource.new(license, context.merge(project: project))
            ), status: status
        end

        def render_errors(form)
          render json: { errors: form.errors.full_messages.map { |msg| { detail: msg } } },
                 status: :unprocessable_entity
        end

        def context
          super.merge(project: project, client: client)
        end

        def model
          @model ||= ::ProjectLicense.find_by(id: params[:id]) || super
        end

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

        def pundit_authorize
          authorize(
            License,
            nil,
            policy_class: Api::Administration::Projects::LicensePolicy,
            project_id: params[:project_id]
          )
        end
      end
    end
  end
end
