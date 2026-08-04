# frozen_string_literal: true

module Users
  class ProfileCompletion < BaseCommand
    # Fields stored on `User` (not `UserProfile`) that always count towads completion percentage.
    USER_FIELDS = %i[first_name last_name].freeze

    attr_reader :user

    def initialize(user)
      @user = user
    end

    def call
      filled = 0
      total = (USER_FIELDS.length + required_default_fields.length + required_custom_fields.length).to_f
      required_default_fields.each do |field|
        filled += 1 if user.user_profile.respond_to?(field) && user.user_profile.send(field).present?
      end
      USER_FIELDS.each do |field|
        filled += 1 if user.send(field).present?
      end

      custom_fields = user.user_profile.custom_fields || {}
      required_custom_fields.each do |field|
        filled += 1 if custom_fields[field.question_id].present?
      end

      broadcast :ok, (filled / total * 100).to_i
    end

    private

    def required_default_fields
      return [] unless user.project

      # `first_name`/`last_name` live on `User` and are already counted via USER_FIELDS.
      # Excluding them here prevents double-counting in the denominator, which otherwise
      # caps completion below 100% whenever they are marked required in profile settings.
      @required_default_fields ||=
        user.project.profile_setting.required_default_fields.select { |_, v| v }.keys.map(&:to_sym) - USER_FIELDS
    end

    def required_custom_fields
      return [] unless user.project

      @required_custom_fields ||= user.project.profile_setting.profile_fields.where(required: true)
    end
  end
end
