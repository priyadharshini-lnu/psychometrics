# frozen_string_literal: true

module Api
  module V2
    module Administration
      module IdpTemplates
        class SkillsController < Api::V2::Administration::SkillsController
          def index
            scoped_skills = Api::Administration::SkillPolicy::Scope.new(
              current_user,
              ::Skill,
              project_id: project_id
            ).resolve

            available_skills = scoped_skills.available_skills_by_plan_id(
              params.dig(:filter, :available_skills_by_plan_id)
            )

            skills = if params.dig(:filter, :name_cont).present? || params.dig(:filter, :filter_by_skill_type).present?
                       available_skills.ransack(params[:filter]).result.limit(10)
                     else
                       available_skills.sample_by_skill_types
                     end

            jsonapi_render json: skills.to_a,
                           options: { resource: Api::V2::Administration::SkillResource }
          end
        end
      end
    end
  end
end
