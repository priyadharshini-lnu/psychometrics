# frozen_string_literal: true

module Api
  module Administration
    module Users
      class RegularPolicy < Api::Administration::UserPolicy
        class Scope < Scope
          def resolve
            scope.all
          end
        end
      end
    end
  end
end
