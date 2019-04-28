# frozen_string_literal: true

module Administration
  module Threesixty
    class RelationshipPolicy < Administration::BasePolicy
      class Scope < Scope
        def resolve
          scope
        end
      end
    end
  end
end
