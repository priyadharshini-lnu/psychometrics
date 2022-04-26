# frozen_string_literal: true

module Api
  module V2
    module Administration
      module Users
        class RegularPolicy < Api::V2::Administration::UserPolicy
          class Scope < Scope
            def resolve
              byebug
              scope.none
            end
          end
        end
      end
    end
  end
end

