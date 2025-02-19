# frozen_string_literal: true

module Api
  module Administration
    class DataReportJobPolicy < Administration::BasePolicy
      def index?
        has_permission?(:clients, :export_data_report)
      end

      def get_password?
        has_permission?(:clients, :export_data_report)
      end

      class Scope < Administration::BasePolicy::Scope
        def resolve
          if @user.is?(:superadmin)
            @scope.all
          elsif @user.is?(:client_admin)
            @scope.joins(:data_report).where(data_report: { owner: @user.client_admin_clients })
          else
            @scope.none
          end
        end
      end
    end
  end
end
