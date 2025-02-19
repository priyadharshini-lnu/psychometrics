# frozen_string_literal: true

module Api
  class V2::Administration::DevelopmentActionsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::DevelopmentAction::Schema
    def meta_details
      {
        permissions: lambda {
          GetPermissionsHash.call!(
            Administration::SkillPolicy,
            context[:user],
            @model,
            %w[
              index
              import
              export
            ],
            { project_id: context[:client_id] }
          )
        }
      }
    end

    def import
      form = Api::V2::Administration::DevelopmentActionImportForm.new(
        file: params[:file],
        ignore_duplicates: params[:ignore_duplicates].present?
      )

      if form.valid?
        AdminJob.call(
          :import_development_actions,
          { ignore_duplicates: form.ignore_duplicates },
          current_user,
          form.processed_file
        )

        head :ok
      else
        render json: { errors: form.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def export
      AdminJob.call(
        :export_development_actions,
        { project_id: params[:project_id] },
        current_user
      )

      head :ok
    end
  end
end
