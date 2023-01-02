# frozen_string_literal: true

module Api
  module Administration
    class ClientPolicy < ::Administration::ClientPolicy
      class Scope < Scope
        def resolve
          ::Administration::ClientPolicy::Scope.new(user, Client).resolve.tenancies
        end
      end
    end
  end
end
