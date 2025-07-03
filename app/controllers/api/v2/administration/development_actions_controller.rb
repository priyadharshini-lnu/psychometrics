# frozen_string_literal: true

module Api
  class V2::Administration::DevelopmentActionsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::DevelopmentAction::Schema

    def meta_details
      {
        permissions: lambda {
          GetPermissionsHash.call!(
            Administration::DevelopmentActionPolicy,
            context[:user],
            @model,
            %w[
              index
              import
              export
              import_translations
              export_translations
              import_global
              export_global
              import_global_translations
              export_global_translations
            ],
            { project_id: context[:project_id] }
          )
        }
      }
    end

    def project_id
      params[:project_id] || project&.id || params.dig(:filter, :project_id_eq)
    end

    def import
      form = Api::V2::Administration::DevelopmentActionImportForm.new(
        file: params[:file],
        project_id: project&.id
      )

      if form.valid?
        AdminJob.call(
          :import_development_actions,
          { project_id: project.id },
          current_user,
          form.file
        )

        render json: :ok
      else
        render json: { errors: form.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def import_global
      form = Api::V2::Administration::DevelopmentActionImportForm.new(
        file: params[:file]
      )

      if form.valid?
        AdminJob.call(
          :import_development_actions,
          { project_id: nil },
          current_user,
          form.file
        )

        render json: :ok
      else
        render json: { errors: form.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def export
      AdminJob.call(
        :export_development_actions,
        { project_id: project.id },
        current_user
      )

      render json: :ok
    end

    def export_global
      AdminJob.call(
        :export_development_actions,
        { project_id: nil },
        current_user
      )

      render json: :ok
    end

    def import_translations
      form = Api::V2::Administration::DevelopmentActionTranslationImportForm.new(
        file: params[:file]
      )

      if form.valid?
        AdminJob.call(
          :import_development_action_translations,
          { project_id: project.id },
          current_user,
          form.file
        )

        render json: :ok
      else
        render json: { errors: form.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def import_global_translations
      form = Api::V2::Administration::DevelopmentActionTranslationImportForm.new(
        file: params[:file]
      )

      if form.valid?
        AdminJob.call(
          :import_development_action_translations,
          { project_id: nil },
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
        :export_development_action_translations,
        { project_id: project.id },
        current_user
      )

      render json: :ok
    end

    def export_global_translations
      AdminJob.call(
        :export_development_action_translations,
        { project_id: nil },
        current_user
      )

      render json: :ok
    end
  end
end
