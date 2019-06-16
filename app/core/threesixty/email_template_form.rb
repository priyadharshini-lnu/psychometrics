# frozen_string_literal: true

module Threesixty
  class EmailTemplateForm < Rectify::Form
    attribute :from, String
    attribute :reply_to_email, String
    attribute :subject, String
    attribute :content, String

    validates :from, :reply_to_email, presence: true
    validates :reply_to_email, format: { with: URI::MailTo::EMAIL_REGEXP }
  end
end
