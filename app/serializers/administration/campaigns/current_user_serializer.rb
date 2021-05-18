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
          %w[create manage_options]
        )
        permissions.transform_keys! { |k| k.camelcase(:lower) }
      end
    end
  end
end
