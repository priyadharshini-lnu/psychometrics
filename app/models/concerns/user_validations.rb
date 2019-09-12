# frozen_string_literal: true

module UserValidations
  extend ActiveSupport::Concern
  included do
    validates :first_name, :last_name, :email, length: { maximum: 100 }
    validates :email, format: { with: /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\Z/i }, presence: true
  end
end
