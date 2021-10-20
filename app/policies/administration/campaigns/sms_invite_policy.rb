# frozen_string_literal: true

module Administration
  module Campaigns
    class SmsInvitePolicy < Administration::BasePolicy
      def index?
        @user.is?(:superadmin) || @user.has_permission?(:campaigns, :view, project_id: project_id)
      end

      def import?
        can_manage_sms_invites?
      end

      def export?
        can_manage_sms_invites?
      end

      def send_sms?
        can_manage_sms_invites?
      end

      def search?
        can_manage_sms_invites?
      end

      def download_example_import_file?
        can_manage_sms_invites?
      end

      private

      def can_manage_sms_invites?
        @user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage_users, project_id: project_id)
      end
    end
  end
end
