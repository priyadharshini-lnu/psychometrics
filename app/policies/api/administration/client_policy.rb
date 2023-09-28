# frozen_string_literal: true

module Api
  module Administration
    class ClientPolicy < ::Administration::ClientPolicy
      def client_auditlog_export_setting?
        index?
      end

      class Scope < BasePolicy::Scope
        def resolve
          ::Administration::ClientPolicy::Scope.new(user, Client).resolve.tenancies
        end
      end
    end
  end
end
