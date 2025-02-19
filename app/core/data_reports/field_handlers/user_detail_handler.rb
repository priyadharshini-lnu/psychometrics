# frozen_string_literal: true

module DataReports::FieldHandlers
  class UserDetailHandler < ::DataReports::BaseFieldHandler
    ALLOWED_FIELD_NAMES = %w[email first_name last_name].freeze

    def call
      return broadcast :ok, default_field if ALLOWED_FIELD_NAMES.include?(field['field_name'])
      return broadcast :ok, profile_field if UserProfile::PROFILE_FIELDS.include?(field['field_name'].to_sym)

      broadcast :ok, custom_field
    end

    private

    def default_field
      user.send(field['field_name']) if user.respond_to?(field['field_name'])
    end

    def profile_field
      user_profile.send(field['field_name']) if user_profile.respond_to?(field['field_name'])
    end

    def user
      @user ||= cu.user
    end

    def user_profile
      @user_profile ||= cu.user.user_profile
    end

    def custom_field
      # custom_field = cu.project.profile_setting.questions.find_by(name: field['field_name'])
      custom_field = ctx[:custom_fields].find { |cf| cf.name == field['field_name'] }

      return unless custom_field

      user_profile = cu.user.user_profile
      user_profile.custom_fields[custom_field.id.to_s] if user_profile.custom_fields
    end
  end
end
