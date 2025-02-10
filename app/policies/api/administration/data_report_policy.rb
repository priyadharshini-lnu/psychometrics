# frozen_string_literal: true

module Api
  module Administration
    class DataReportPolicy < Administration::BasePolicy
      def run?
        @user.is?(:superadmin) || (has_permission?(:clients, :export_data_report) &&
          @user.client_admin_clients.include?(@record.owner))
      end

      def index?
        has_permission?(:clients, :export_data_report)
      end

      def create?
        @user.is?(:superadmin)
      end

      def update?
        @user.is?(:superadmin)
      end

      class Scope < Administration::BasePolicy::Scope
        def resolve
          if @user.is?(:superadmin)
            @scope.all
          elsif @user.is?(:client_admin)
            @scope.where(owner: @user.client_admin_clients)
          else
            @scope.none
          end
        end
      end
    end
  end
end
