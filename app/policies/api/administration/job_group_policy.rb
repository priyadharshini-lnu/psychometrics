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
          scope.where(project_id: project_id)
        end
      end
    end
  end
end
