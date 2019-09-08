# frozen_string_literal: true

module Administration
  module Users
    class FetchUserForm < Rectify::Form
      attribute :email, String

      validates :email, presence: true
      validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
    end
  end
end
