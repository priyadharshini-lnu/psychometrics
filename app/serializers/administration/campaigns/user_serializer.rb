# frozen_string_literal: true

module Administration
  module Campaigns
    class UserSerializer < Panko::Serializer
      attributes :id, :first_name, :last_name, :email, :full_name, :created_by, :updated_by,
                 :created_at, :updated_at, :locale, :active, :completion_status,
                 :status, :permissions, :started_at, :completed_at

      delegate :active, :completion_status, :status, to: :campaign_user

      def started_at
        campaign_user&.started_at && I18n.l(campaign_user&.started_at, format: :short)
      end

      def completed_at
        campaign_user&.completed_at && I18n.l(campaign_user&.completed_at, format: :short)
      end

      def permissions
        GetPermissionsHash.call!(
          Administration::Campaigns::UserPolicy,
          current_user,
          object,
          [
            'edit',
            %w[login_as spoof],
            'reset_password',
            %w[remove destroy],
            'push_webhook'
          ],
          {
            project_id: context[:project_id],
            campaign_id: context[:campaign_id]
          }
        )
      end

      def created_at
        I18n.l object.created_at, format: :short
      end

      def created_by
        object.creator&.decorate&.full_name
      end

      def updated_at
        I18n.l object.updated_at, format: :short
      end

      def updated_by
        object.modifier&.decorate&.full_name
      end

      def full_name
        base_name = object.decorate.full_name
        object.is_uat? ? "UAT - #{base_name}" : base_name
      end

      def campaign_user
        object.campaign_users.find { |cu| cu.campaign_id == context[:campaign_id] }
      end

      private

      def current_user
        context[:current_user]
      end
    end
  end
end
