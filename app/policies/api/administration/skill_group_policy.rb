# frozen_string_literal: true

module Api
  module Administration
    class SkillGroupPolicy < BasePolicy
      def index?
        has_permission?(:skills, :view, project_id: project_id) ||
          has_permission?(:skills, :manage, project_id: project_id)
      end

      class Scope < Api::Administration::BasePolicy::Scope
        def resolve
          scope.where(project_id: project_id)
        end
      end
    end
  end
end
