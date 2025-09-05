# frozen_string_literal: true

module Api
  module V2
    module Administration
      class ProficiencyLevelsController < Api::V2::Administration::BaseController
        skip_before_action :enforce_geo_restriction
        validate_crud_requests Api::V2::ProficiencyLevel::Schema
        validates_request_schema :create, -> { Api::V2::ProficiencyLevel::Contract.new }

        before_action :find_skill, only: [:skill_proficiency]

        def export
          AdminJob.call(
            :export_proficiency_levels,
            { project_id: project&.id },
            current_user
          )

          render json: :ok
        end

        def export_translations
          AdminJob.call(
            :export_proficiency_level_translations,
            { project_id: project&.id },
            current_user
          )

          render json: :ok
        end

        def import_translations
          form = Api::V2::Administration::ProficiencyLevelTranslationImportForm.new(
            file: params[:file],
            project_id: project&.id
          )
          if form.valid?
            AdminJob.call(
              :import_proficiency_level_translations,
              { project_id: project&.id },
              current_user,
              form.processed_file
            )
            render json: :ok
          else
            render json: { errors: form.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def import
          form = Api::V2::Administration::ProficiencyLevelImportForm.new(
            file: params[:file],
            project_id: project&.id,
            ignore_duplicates: params[:ignore_duplicates].present?
          )
          if form.valid?
            AdminJob.call(:import_proficiency_levels,
                          { ignore_duplicates: form.ignore_duplicates, project_id: form.project_id },
                          current_user, form.processed_file)

            render json: :ok
          else
            render json: { errors: form.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def skill_proficiency
          proficiency_level = Skills::GetProficiencyLevel.call!(@skill)[:proficiency_level] || []
          render json: proficiency_level
        end

        private

        def find_skill
          @skill = ::Skill.find_by(id: params[:skill_id])
          return if @skill

          render json: { error: 'Skill not found' }, status: :not_found
        end
      end
    end
  end
end
