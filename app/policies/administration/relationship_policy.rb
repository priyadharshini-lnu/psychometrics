# frozen_string_literal: true

module Administration
  class RelationshipPolicy < Administration::BasePolicy
    def fetch_with_usage?
      index?
    end

    class Scope < Scope
      def resolve
        scope
      end
    end
  end
end
