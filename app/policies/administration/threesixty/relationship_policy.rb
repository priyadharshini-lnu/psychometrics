# frozen_string_literal: true

module Administration
  module Threesixty
    class RelationshipPolicy < Administration::BasePolicy
      def fetch_with_usage?
        create?
      end

      def create?
        # TODO (atanych): check campaign_id
        return true if @user.is?(:superadmin)
        return true if @user.is?(:client_admin, :project_admin) && @user.has_grant?(:clients, :manage)

        false
      end

      def destroy?
        create?
      end

      def update?
        create?
      end

      class Scope < Scope
        def resolve
          scope
        end
      end
    end
  end
end
