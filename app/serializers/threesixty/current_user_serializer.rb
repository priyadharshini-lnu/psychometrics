# frozen_string_literal: true

module Threesixty
  class CurrentUserSerializer < ActiveModel::Serializer
    attributes :id, :is_manager, :email, :first_name, :last_name, :full_name,
               :is_super_admin, :is_anonym, :permissions

    def is_manager # rubocop:disable Naming/PredicateName
      true
    end

    def is_super_admin # rubocop:disable Naming/PredicateName
      object.superadmin?
    end

    def full_name
      object.decorate.full_name
    end

    def permissions
      permissions = GetPermissionsHash.call!(
        Administration::CampaignPolicy,
        object,
        nil,
        [
          %w[manage_options update_campaign_options],
          'manage_messages'
        ]
      )
      permissions.transform_keys! { |k| k.camelcase(:lower) }
    end
  end
end
