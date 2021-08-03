# frozen_string_literal: true

module Administration
  module Campaigns
    class CurrentUserSerializer < ActiveModel::Serializer
      attributes :id, :grants, :role, :permissions

      def grants
        instance_options[:current_membership]&.grants&.data || {}
      end

      def permissions
        permissions = GetPermissionsHash.call!(
          Administration::CampaignPolicy,
          object,
          nil,
          [
            'create',
            %w[manage_options update_campaign_options]
          ],
          instance_options[:project_id]
        )
        permissions.transform_keys! { |k| k.camelcase(:lower) }
      end
    end
  end
end
