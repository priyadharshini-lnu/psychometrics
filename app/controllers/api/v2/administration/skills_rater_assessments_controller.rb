# frozen_string_literal: true

module Api
  module V2
    module Administration
      class SkillsRaterAssessmentsController < Api::V2::Administration::BaseController
        def import_taxonomies
          form = ::Administration::SkillsRaterAssessments::TaxonomiesImportForm.new(
            file: params[:file],
            project_id: params[:project_id]
          )

          if form.valid?
            AdminJob.call(
              :import_skills_rater_taxonomies,
              { project_id: params[:project_id] },
              current_user,
              form.processed_file
            )
            render json: :ok
          else
            render json: { errors: form.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def pundit_authorize
          authorize(
            nil,
            nil,
            policy_class: Api::Administration::SkillsRaterAssessmentPolicy,
            project_id: params[:project_id]
          )
        end
      end
    end
  end
end
