# frozen_string_literal: true

module Api
  module V2
    module Administration
      class ProjectLicensesController < Api::V2::Administration::BaseController
        skip_before_action :jsonapi_request_handling, only: %i[create update]
        validates_request_schema :create, lambda {
          Api::V2::ProjectLicense::CreateContract.new(
            schema: Api::V2::ProjectLicense::Schema.create_request
          )
        }

        validates_request_schema :update, lambda {
          Api::V2::ProjectLicense::UpdateContract.new(
            schema: Api::V2::ProjectLicense::Schema.update_request
          )
        }

        def create
          project_license = ::Projects::Licenses::Create.call!(license_params, project)
          render_license(project_license.license, :created)
        end

        def update
          project_license = ::Projects::Licenses::Update.call!(license_params, model)
          render_license(project_license.license, :ok)
        end

        private

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
