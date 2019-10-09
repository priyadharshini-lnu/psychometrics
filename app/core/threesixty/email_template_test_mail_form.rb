# frozen_string_literal: true

module Threesixty
  class EmailTemplateTestMailForm < Rectify::Form
    attribute :to_email, String

    validates :to_email, presence: true
    validates :to_email, format: { with: Devise.email_regexp }, allow_blank: true
  end
end
