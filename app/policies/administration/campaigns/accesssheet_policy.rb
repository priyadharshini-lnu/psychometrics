# frozen_string_literal: true

module Administration
  module Campaigns
    class AccesssheetPolicy < Administration::BasePolicy
      def index?
        @user.is?(:superadmin) || @user.has_permission?(:datasheets, :view, project_id: project_id)
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

      def manage?
        @user.is?(:superadmin) || @user.has_permission?(
          :datasheets, :manage, project_id: project_id, campaign_id: campaign_id
        )
      end
    end
  end
end
