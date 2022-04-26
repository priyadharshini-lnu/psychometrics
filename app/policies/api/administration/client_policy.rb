# frozen_string_literal: true

module Api
  module Administration
    class ClientPolicy < ::Administration::ClientPolicy
      def replace_project_manager?(_)
        update?
      end

      def replace_account_manager?(_)
        update?
      end

      def create_with_project_manager?(_)
        create?
      end

      def create_with_account_manager?(_)
        create?
      end

      class Scope < Scope
        def resolve
          ::Administration::ClientPolicy::Scope.new(user, Client).resolve.tenancies
        end
      end
    end
  end
end
