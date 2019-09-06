# frozen_string_literal: true

module Threesixty
  class EmailTemplateTestMailForm < Rectify::Form
    attribute :to_email, String

    validates :to_email, presence: true
    validates :to_email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
  end
end
