# frozen_string_literal: true

module Administration
  class RelationshipPolicy < Administration::BasePolicy
    def fetch_with_usage?
      @user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage, project_id: project_id)
    end

    def create?
      @user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage, project_id: project_id)
    end

    class Scope < Scope
      def resolve
        scope
      end
    end
  end
end
