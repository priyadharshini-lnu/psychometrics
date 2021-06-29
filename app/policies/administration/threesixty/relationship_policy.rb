# frozen_string_literal: true

module Administration
  module Threesixty
    class RelationshipPolicy < BasePolicy
      def fetch_with_usage?
        user.is?(:superadmin) || user.has_client_grant?(:campaigns, :manage, @project_id)
      end

      class Scope < Scope
        def resolve
          scope
        end
      end
    end
  end
end
