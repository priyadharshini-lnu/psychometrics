# frozen_string_literal: true

module Users
  class SuperAdminEditForm < AdminEditForm
    attribute :email, String

    validates :email, presence: true
    validates :email, format: { with: Devise.email_regexp }
  end
end
