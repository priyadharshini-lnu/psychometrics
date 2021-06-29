# frozen_string_literal: true

module Administration
  module Threesixty
    class OptionPolicy < BasePolicy
      def participant_options?
        @user.is?(:superadmin) || @user.has_client_grant?(:campaigns, :manage_options, @project_id)
      end

      def report_options?
        @user.is?(:superadmin) || @user.has_client_grant?(:campaigns, :manage_options, @project_id)
      end

      def message_options?
        @user.is?(:superadmin) || @user.has_client_grant?(:campaigns, :manage_options, @project_id)
      end
    end
  end
end
