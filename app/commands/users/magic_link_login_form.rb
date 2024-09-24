# frozen_string_literal: true

module Users
  class MagicLinkLoginForm < Rectify::Form
    attribute :email, String
    validates :email, presence: true
    validates :email, format: { with: Devise.email_regexp, message: I18n.t('auth.magic_link.invalid_email') }
  end
end
