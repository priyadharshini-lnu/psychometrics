# frozen_string_literal: true

module Administration
  module Users
    class FetchUserForm < Rectify::Form
      attribute :email, String

      validates :email, presence: true
      validates :email, format: { with: Devise.email_regexp }
    end
  end
end
