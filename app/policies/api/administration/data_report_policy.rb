# frozen_string_literal: true

module Api
  module Administration
    class DataReportPolicy < Administration::BasePolicy
      def run?
        return @user.is?(:superadmin) if @record.scope_global?

        @user.is?(:superadmin) || (has_permission?(:clients, :export_data_report) &&
          @user.client_admin_clients.include?(@record.owner))
      end

      def show?
        run?
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
          geo_filtered_scope = @scope.geo_scoped(Current.user_country)

          if @user.is?(:superadmin)
            geo_filtered_scope.all
          elsif @user.is?(:client_admin)
            geo_filtered_scope.where(scope: :client, owner: @user.client_admin_clients)
          else
            geo_filtered_scope.none
          end
        end
      end
    end
  end
end
