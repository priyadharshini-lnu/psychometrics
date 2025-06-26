# frozen_string_literal: true

module Api
  module Administration
    class SkillsJobRolePolicy < BasePolicy
      def index?
        has_permission?(:skills, :view, project_id: project_id) &&
          has_permission?(:job_roles, :view, project_id: project_id)
      end

      def create?
        manage?
      end

      def update?
        manage?
      end

      def destroy?
        manage?
      end

      def manage?
        has_permission?(:skills, :manage, project_id: project_id) &&
          has_permission?(:job_roles, :manage, project_id: project_id)
      end

      class Scope < Api::Administration::BasePolicy::Scope
        def resolve
          return scope unless project_id

          base = scope.joins(:skill, :job_role)

          if filter&.dig(:include_global_skills_job_roles)
            base.where(
              skills: { project_id: [nil, project_id] },
              job_roles: { project_id: [nil, project_id] }
            )
          else
            base.where(
              skills: { project_id: project_id },
              job_roles: { project_id: project_id }
            )
          end
        end
      end
    end
  end
end
