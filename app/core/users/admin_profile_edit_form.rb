# frozen_string_literal: true

module Users
  class AdminProfileEditForm < Rectify::Form
    attribute :email, String
    attribute :password, String
    attribute :password_confirmation, String
    attribute :first_name, String
    attribute :last_name, String
    attribute :weekly_license_stats, Boolean

    validates :first_name, :last_name, :email, presence: true
    validates :email, format: { with: Devise.email_regexp }
    validates :password, strong_password: true

    def map_model(model)
      self.weekly_license_stats = model.personal_settings['weekly_license_stats']
    end
  end
end
