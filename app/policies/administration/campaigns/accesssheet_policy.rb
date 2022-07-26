# frozen_string_literal: true

module Administration
  module Campaigns
    class AccesssheetPolicy < Administration::BasePolicy
      def index?
        manage?
      end

      def get_columns?
        manage?
      end

      def add_column?
        manage?
      end

      def update_column?
        manage?
      end

      def remove_columns?
        manage?
      end

      def update_columns_order?
        manage?
      end

      private

      def manage?
        @user.is?(:superadmin) || @user.has_permission?(
          :dashboards, :accesssheet_settings, project_id: project_id, campaign_id: campaign_id
        )
      end
    end
  end
end
