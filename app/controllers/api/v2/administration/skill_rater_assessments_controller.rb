# frozen_string_literal: true

module Api
  module V2
    module Administration
      class SkillRaterAssessmentsController < Api::V2::Administration::BaseController
        skip_before_action :enforce_geo_restriction

        def import_taxonomies
          form = ::Administration::SkillRaterAssessments::TaxonomiesImportForm.new(
            file: params[:file],
            project_id: params[:project_id]
          )

          if form.valid?
            AdminJob.call(
              :import_skill_rater_taxonomies,
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
            policy_class: Api::Administration::SkillRaterAssessmentPolicy,
            project_id: params[:project_id]
          )
        end
      end
    end
  end
end
