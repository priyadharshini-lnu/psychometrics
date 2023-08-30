# frozen_string_literal: true

module Api
  module Administration
    class ClientAuditlogExportSettingPolicy < ::Administration::BasePolicy
      def update?
        true
      end

      def create_or_get?
        update?
      end

      def test_connection?
        update?
      end

      class Scope < BasePolicy::Scope
        def resolve
          return scope if @user.is?(:superadmin)

          # TODO: (atanych): maybe there is more optional SQL
          scope.where(client: ::Administration::ClientPolicy::Scope.new(user, Client).resolve.tenancies)
        end
      end
    end
  end
end
