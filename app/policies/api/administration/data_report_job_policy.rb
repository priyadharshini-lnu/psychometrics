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
          geo_filtered_scope = @scope.geo_scoped(Current.user_country)

          if @user.is?(:superadmin)
            geo_filtered_scope.all
          elsif @user.is?(:client_admin)
            geo_filtered_scope.joins(:data_report).where(data_report: { owner: @user.client_admin_clients })
          else
            geo_filtered_scope.none
          end
        end
      end
    end
  end
end
