# frozen_string_literal: true

module Administration
  module Threesixty
    class CurrentUserSerializer < ActiveModel::Serializer
      attributes :id, :is_manager, :email, :first_name, :last_name, :full_name, :role,
                 :is_anonym, :permissions, :photo, :timezone, :last_sign_in_at, :role_title, :name

      def is_manager
        true
      end

      delegate(*UserProfile::PROFILE_FIELDS, to: :user_profile)

      def photo
        object.user_profile.photo&.url
      end

      def role_title
        object.decorate.role
      end

      def full_name
        object.decorate.full_name
      end

      alias name full_name

      def permissions
        return unless current_project_id

        permissions = GetPermissionsHash.call!(
          Administration::Threesixty::CampaignPolicy,
          object,
          nil,
          %w[
            edit_participant_options
            edit_report_options
            access_email_messages
            access_instruction_messages
            access_messages_options
            edit_assessment
            edit_report
            edit_dimension
            manage_relationships
            regenerate_report
            manage_admins
          ],
          {
            project_id: current_project_id,
            campaign_id: campaign_id
          }
        )
        permissions.transform_keys! { |k| k.camelcase(:lower) }
      end

      private

      def user_profile
        object.user_profile
      end

      def current_project_id
        instance_options[:project_id]
      end

      def campaign_id
        instance_options[:campaign_id]
      end
    end
  end
end
