# frozen_string_literal: true

module Api
  module Administration
    class DataReportJobPolicy < Administration::BasePolicy
      attr_reader :filter

      def initialize(user, record, extra = {})
        super
        @filter = extra[:filter] || {}
      end

      def index?
        has_permission?(:clients, :export_data_report) && authorized_for_data_report?
      end

      def get_password?
        has_permission?(:clients, :export_data_report) && authorized_for_data_report?
      end

      private

      def authorized_for_data_report?
        return false unless record

        if filter[:client_id].nil?
          record.scope_global? && @user.is?(:superadmin)
        else
          record.scope_client? && record.owner_id == filter[:client_id].to_i
        end
      end

      class Scope < Administration::BasePolicy::Scope
        attr_reader :filter

        def initialize(user, scope, opts = {})
          super
          @filter = opts[:filter] || {}
        end

        def resolve
          geo_filtered_scope = @scope.geo_scoped(Current.user_country)

          if @user.is?(:superadmin)
            if filter[:client_id].nil?
              geo_filtered_scope.joins(:data_report).where(data_reports: { scope: DataReport.scopes[:global] })
            else
              geo_filtered_scope.joins(:data_report).where(data_reports: { owner_id: filter[:client_id] })
            end
          elsif @user.is?(:client_admin)
            if filter[:client_id].nil?
              geo_filtered_scope.none
            else
              geo_filtered_scope.joins(:data_report).where(data_reports: { owner: @user.client_admin_clients })
            end
          else
            geo_filtered_scope.none
          end
        end
      end
    end
  end
end
