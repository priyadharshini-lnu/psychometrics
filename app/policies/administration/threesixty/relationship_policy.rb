# frozen_string_literal: true

module Administration
  module Threesixty
    class RelationshipPolicy < BasePolicy
      def fetch_with_usage?
        has_permission?(:campaigns, :manage)
      end

      class Scope < Scope
        def resolve
          scope
        end
      end
    end
  end
end
