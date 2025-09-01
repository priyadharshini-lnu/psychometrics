# frozen_string_literal: true

module Api
  module V2
    module Administration
      class JobRolesController < Api::V2::Administration::BaseController
        skip_before_action :enforce_geo_restriction
        validates_request_schema :create, lambda {
          JobRole::Contract.new(schema: JobRole::Schema.create_request)
        }
        validates_request_schema :update, -> { JobRole::Contract.new(schema: JobRole::Schema.update_request) }
        validate_crud_requests JobRole::Schema

        def import_translations
          form = Api::V2::Administration::JobRoleTranslationImportForm.new(
            file: params[:file],
            project_id: project_id
          )

          if form.valid?
            AdminJob.call(
              :import_job_roles_translations,
              { project_id: project_id },
              current_user,
              form.file
            )

            render json: :ok
          else
            render json: { errors: form.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def export_translations
          AdminJob.call(
            :export_job_roles_translations,
            { project_id: project_id },
            current_user
          )

          render json: :ok
        end

        def meta_details
          {
            permissions: lambda {
              GetPermissionsHash.call!(
                ::Api::Administration::JobRolePolicy,
                context[:user],
                @model,
                %w[
                  index
                  create
                  update
                  destroy
                  import_translations
                  export_translations
                ],
                { project_id: project_id }
              )
            }
          }
        end

        def context
          super.merge(
            filter: params[:filter]
          )
        end
      end
    end
  end
end
