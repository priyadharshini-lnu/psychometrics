# frozen_string_literal: true

module Api
  module Administration
    class JobGroupPolicy < BasePolicy
      def index?
        has_permission?(:job_roles, :manage, project_id: project_id) ||
          has_permission?(:job_roles, :view, project_id: project_id)
      end

      class Scope < Api::Administration::BasePolicy::Scope
        def resolve
          return scope unless project_id

          if filter&.dig(:include_global_groups)
            scope.where(project_id: [nil, project_id])
          else
            scope.where(project_id: project_id)
          end
        end
      end
    end
  end
end
