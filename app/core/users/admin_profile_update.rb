# frozen_string_literal: true

module Users
  class AdminProfileUpdate < BaseCommand
    private_attr_reader :form, :user

    def initialize(form, user)
      @form = form
      @user = user
    end

    def call
      return broadcast :invalid, form if form.invalid?

      params = add_weekly_license_stats(form.attributes)
      user.update!(params)
      broadcast :ok, user
    end

    private

    def add_weekly_license_stats(params)
      params.merge!(
        personal_settings: { weekly_license_stats: params[:weekly_license_stats] }
      ).delete(:weekly_license_stats)
      params
    end
  end
end
