# frozen_string_literal: true

module Administration
  module Threesixty
    class EvaluatorPolicy < Administration::BasePolicy
      def index?
        # TODO (atanych): check campaign_id
        return true if @user.is?(:superadmin)
        return true if @user.is?(:client_admin, :project_admin) && @user.has_grant?(:clients, :manage)

        false
      end

      def create_all?
        index?
      end

      def download_example_import_file?
        index?
      end
    end
  end
end
