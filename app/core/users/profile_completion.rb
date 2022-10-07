# frozen_string_literal: true

module Users
  class ProfileCompletion < BaseCommand
    attr_reader :user

    def initialize(user)
      @user = user
    end

    def call
      filled = 0
      total = 7.0
      %i[age photo gender timezone locale].each do |field|
        filled += 1 if user.user_profile.send(field).present?
      end
      %i[first_name last_name].each do |field|
        filled += 1 if user.send(field).present?
      end

      broadcast :ok, (filled / total * 100).to_i
    end
  end
end
