# frozen_string_literal: true

module Users
  class AdminProfileEditForm < Rectify::Form
    attribute :email, String
    attribute :change_password, Boolean
    attribute :current_password, String
    attribute :password, String
    attribute :password_confirmation, String
    attribute :first_name, String
    attribute :last_name, String
    attribute :weekly_license_stats, Boolean

    validates :first_name, :last_name, :email, presence: true
    validates :email, format: { with: Devise.email_regexp }
    validates :current_password, :password, :password_confirmation, presence: true, if: -> { change_password }

    def map_model(model)
      self.weekly_license_stats = model.settings['weekly_license_stats']
    end
  end
end
