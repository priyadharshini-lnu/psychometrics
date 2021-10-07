# frozen_string_literal: true

module Administration
  module Campaigns
    class CampaignAdminSerializer < ActiveModel::Serializer
      attributes :id, :user_id, :first_name, :last_name, :email, :created_at, :permissions
      attribute :permissions, if: :include_permissions?
      has_one :grants, serializer: MembershipGrantsSerializer, if: :include_grants?

      def created_at
        object.created_at && I18n.l(object.created_at, format: :short)
      end

      def first_name
        object.user.first_name
      end

      def last_name
        object.user.last_name
      end

      def email
        object.user.email
      end

      def permissions
        permissions = GetPermissionsHash.call!(
          Administration::Campaigns::AdminPolicy,
          current_user,
          object,
          [
            %w[login_as spoof],
            'edit',
            %w[remove destroy],
            'reset_password',
            'send_mail'
          ],
          instance_options[:project_id]
        )
        permissions.transform_keys! { |k| k.camelcase(:lower) }
      end

      def include_permissions?
        instance_options[:include_permissions]
      end

      def include_grants?
        instance_options[:include_grants]
      end

      private

      def current_user
        instance_options[:current_user]
      end
    end
  end
end
