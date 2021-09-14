# frozen_string_literal: true

module EmailTest
  class Form < Rectify::Form
    mimic :email_test_form

    attribute :to_email, String

    validates :to_email, presence: true
    validates :to_email, format: { with: Devise.email_regexp }, allow_blank: true
  end
end
