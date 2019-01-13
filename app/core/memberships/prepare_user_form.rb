module Memberships
  class PrepareUserForm < Rectify::Form
    attribute :email, String

    validates :email, presence: true
    validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
  end
end
