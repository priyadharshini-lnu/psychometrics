# frozen_string_literal: true

module Api
  module V2
    module Administration
      class SkillsController < Api::V2::Administration::BaseController
        validate_crud_requests Api::V2::Skill::Schema
        include Api::V2::Administration::Concerns::Taggable

        def import
          form = Api::V2::Administration::SkillImportForm.new(
            file: params[:file],
            ignore_duplicates: params[:ignore_duplicates].present?
          )

          if form.valid?
            AdminJob.call(
              :import_skills,
              { ignore_duplicates: form.ignore_duplicates },
              current_user,
              form.processed_file
            )

            render json: { message: 'Skills import job has been queued' }
          else
            render json: { errors: form.errors.full_messages }, status: :unprocessable_entity
          end
        end

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
                ],
                { project_id: context[:project_id] }
              )
            }
          }
        end
      end
    end
  end
end
