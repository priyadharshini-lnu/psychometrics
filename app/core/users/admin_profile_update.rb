# frozen_string_literal: true

module Users
  class AdminProfileUpdate < BaseCommand
    private_attr_reader :form, :user

    def initialize(form, user)
      @form = form
      @user = user
    end

    def call
      params = add_weekly_license_stats(form.attributes.except(:change_password))
      if form.change_password
        user.update_with_password(params)
      else
        user.update(params.except(:current_password, :password, :password_confirmation))
      end

      broadcast :ok, user
    end

    private

    def add_weekly_license_stats(params)
      params.merge!(
        settings: { weekly_license_stats: params[:weekly_license_stats] }
      ).delete(:weekly_license_stats)
      params
    end
  end
end
