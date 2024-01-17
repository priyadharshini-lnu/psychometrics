# frozen_string_literal: true

module Administration
  module Campaigns
    class AdminPolicy < Administration::BasePolicy
      USER_PARAMETERS = %i[first_name last_name email].freeze
      UPDATE_USER_PARAMETERS = [:id, USER_PARAMETERS].flatten.freeze
      GRANT_PARAMETERS = [data: [
        campaigns: [],
        dimensions: [],
        reports: [],
        assessments: [],
        communications: [],
        results: [],
        assessors: [],
        registration_codes: [],
        datasheets: [],
        sms_invites: []
      ]].freeze

      def index?
        manage_admins?
      end

      def show?
        manage_admins?
      end

      def create?
        manage_admins?
      end

      def edit?
        manage_admins?
      end

      def destroy?
        manage_admins?
      end

      def update?
        manage_admins?
      end

      def reset_password?
        manage_admins?
      end

      def spoof?
        manage_admins?
      end

      def send_mail?
        manage_admins?
      end

      class Scope < Administration::BasePolicy::Scope
        def resolve
          return scope if @user.is?(:superadmin)

          project_ids = @user.is?(:client_admin) ? @user.client_admin_project_ids : @user.project_admin_client_ids
          campaign_ids = Campaign.where(project_id: project_ids).pluck(:id)
          scope.where(campaign_id: campaign_ids)
        end
      end

      private

      def manage_admins?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :manage_admins, project_id: project_id, campaign_id: campaign_id
        )
      end
    end
  end
end
