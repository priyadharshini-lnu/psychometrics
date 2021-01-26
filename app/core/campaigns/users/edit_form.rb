# frozen_string_literal: true

module Campaigns
  module Users
    class EditForm < Rectify::Form
      mimic :user

      attribute :first_name, String
      attribute :last_name, String
      attribute :email, String
      attribute :locale, String

      validates :first_name, :last_name, :email, presence: true
      validates :email, format: { with: Devise.email_regexp }
      validates :locale, inclusion: { in: I18n.available_locales.map(&:to_s), allow_blank: true }
    end
  end
end
