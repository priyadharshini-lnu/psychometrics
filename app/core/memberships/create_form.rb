# frozen_string_literal: true

module Memberships
  class CreateForm < Rectify::Form
    attribute :first_name, String
    attribute :last_name, String
    attribute :parent_id, Integer

    validates :email, presence: true
    validates :email, format: { with: Devise.email_regexp }
  end
end
