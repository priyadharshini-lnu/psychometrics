# frozen_string_literal: true

module Users
  class ProfileCompletion < BaseCommand
    attr_reader :user

    def initialize(user)
      @user = user
    end

    def call
      user_fields = %i[first_name last_name]
      user_profile_fields = %i[age photo gender locale]
      filled = 0
      total = (user_fields.length + user_profile_fields.length).to_f
      user_profile_fields.each do |field|
        filled += 1 if user.user_profile.send(field).present?
      end
      user_fields.each do |field|
        filled += 1 if user.send(field).present?
      end

      broadcast :ok, (filled / total * 100).to_i
    end
  end
end
