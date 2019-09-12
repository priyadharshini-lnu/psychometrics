# frozen_string_literal: true

module Administration
  module Assessments
    class ClientPolicy < Administration::ClientPolicy
      class Scope < Scope
        def resolve
          super
        end
      end
    end
  end
end
