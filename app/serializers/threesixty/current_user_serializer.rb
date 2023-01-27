# frozen_string_literal: true

module Threesixty
  class CurrentUserSerializer < ActiveModel::Serializer
    attributes :id, :is_manager, :email, :first_name, :last_name, :full_name, :role,
               :is_anonym, :permissions, :photo, :timezone, :custom_fields,
               :age, :gender, :locale, :profile_completion_percentage, :last_sign_in_at, :updated_at,
               :update_profile_required, :update_profile_message

    def updated_at
      object.user_profile.updated_at
    end

    def update_profile_required
      return false unless object.project

      update_in = object.project.profile_setting.update_in
      return true if Users::ProfileCompletion.call!(object) < 100
      return false unless update_in

      (Time.current - object.user_profile.updated_at) > update_in.month
    end

    def update_profile_message
      return I18n.t('profile.incomplete') if Users::ProfileCompletion.call!(object) < 100

      update_in = object.project.profile_setting.update_in || 9999
      updated_at = object.user_profile.updated_at
      if (Time.current - updated_at) > update_in.month
        diff = (update_in.month - updated_at.month) + (12 * (update_in.year - updated_at.year))
        I18n.t('profile.old_data', { month: diff })
      end
    end

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
