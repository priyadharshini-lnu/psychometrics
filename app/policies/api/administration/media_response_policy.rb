# frozen_string_literal: true

module Api
  module Administration
    class MediaResponsePolicy < ::Administration::BasePolicy
      def index?
        user.admin?
      end

      def generate_transcription?
        user.admin?
      end

      def admin?
        @user.is?(:superadmin, :client_admin, :project_admin, :campaign_admin)
      end
    end
  end
end
