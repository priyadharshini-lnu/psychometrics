# frozen_string_literal: true

module Administration
  module Campaigns
    class SmsInvitePolicy < Administration::BasePolicy
      def index?
        @user.is?(:superadmin) || @user.has_permission?(
          :sms_invites, :view, project_id: project_id, campaign_id: campaign_id
        )
      end

      def create?
        can_manage_sms_invites?
      end

      def update?
        can_manage_sms_invites?
      end

      def destroy?
        can_manage_sms_invites?
      end

      def import?
        can_manage_sms_invites?
      end

      def export?
        @user.is?(:superadmin) || @user.has_permission?(
          :sms_invites, :view, project_id: project_id, campaign_id: campaign_id
        )
      end

      def send_sms?
        project = Project.find_by(id: project_id)
        can_manage_sms_invites? && project&.sms_notification?
      end

      def search?
        can_manage_sms_invites?
      end

      def download_example_import_file?
        can_manage_sms_invites?
      end

      private

      def can_manage_sms_invites?
        @user.is?(:superadmin) || @user.has_permission?(
          :sms_invites, :manage, project_id: project_id, campaign_id: campaign_id
        )
      end
    end
  end
end
