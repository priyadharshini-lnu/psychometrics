# frozen_string_literal: true

module Administration
  module Campaigns
    class UserSerializer < ActiveModel::Serializer
      attributes :id, :first_name, :last_name, :email, :full_name, :created_by, :updated_by,
                 :created_at, :updated_at, :locale, :active, :completion_status,
                 :status, :permissions

      delegate :active, :completion_status, to: :campaign_user

      attribute :started_at do
        campaign_user&.started_at && I18n.l(campaign_user&.started_at, format: :short)
      end

      attribute :completed_at do
        campaign_user&.completed_at && I18n.l(campaign_user&.completed_at, format: :short)
      end

      def permissions
        GetPermissionsHash.call!(
          Administration::Campaigns::UserPolicy,
          {
            user: current_user,
            project_id: campaign_user.campaign.project_id
          },
          object,
          [
            'edit',
            %w[login_as spoof],
            'reset_password',
            %w[remove destroy]
          ]
        )
      end

      def status
        campaign_user.real_status
      end

      def created_at
        I18n.l object.created_at, format: :short
      end

      def created_by
        object.creator&.email
      end

      def updated_at
        I18n.l object.updated_at, format: :short
      end

      def updated_by
        object.modifier&.email
      end

      def full_name
        object.decorate.full_name
      end

      def campaign_user
        object.campaign_users.find { |cu| cu.campaign_id == @instance_options[:campaign_id] }
      end

      private

      def current_user
        instance_options[:current_user]
      end
    end
  end
end
