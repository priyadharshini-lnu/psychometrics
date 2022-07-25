# frozen_string_literal: true

module Threesixty
  class CurrentUserSerializer < ActiveModel::Serializer
    attributes :id, :is_manager, :email, :first_name, :last_name, :full_name,
               :is_super_admin, :is_anonym, :permissions, :photo, :timezone

    def is_manager # rubocop:disable Naming/PredicateName
      true
    end

    def photo
      object.photo&.url
    end

    def is_super_admin # rubocop:disable Naming/PredicateName
      object.superadmin?
    end

    def full_name
      object.decorate.full_name
    end

    def permissions
      return unless current_project_id

      permissions = GetPermissionsHash.call!(
        Administration::CampaignPolicy,
        object,
        nil,
        [
          %w[manage_options update_campaign_options],
          'manage_messages'
        ],
        {
          project_id: current_project_id
        }
      )
      permissions.transform_keys! { |k| k.camelcase(:lower) }
    end

    private

    def current_project_id
      instance_options[:project_id]
    end
  end
end
