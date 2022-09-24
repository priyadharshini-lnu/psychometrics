# frozen_string_literal: true

module Threesixty
  class CurrentUserSerializer < ActiveModel::Serializer
    attributes :id, :is_manager, :email, :first_name, :last_name, :full_name,
               :is_super_admin, :is_anonym, :permissions, :photo, :timezone, :custom_fields,
               :age, :gender, :locale, :profile_completion_percentage, :last_sign_in_at

    def is_manager
      true
    end

    def profile_completion_percentage
      Users::ProfileCompletion.call!(object)
    end

    delegate(*UserProfile::PROFILE_FIELDS, :custom_fields, to: :user_profile)

    def photo
      object.user_profile.photo&.url
    end

    def is_super_admin
      object.superadmin?
    end

    def full_name
      object.decorate.full_name
    end

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
        ],
        {
          project_id: current_project_id
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
  end
end
