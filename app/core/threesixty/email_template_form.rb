# frozen_string_literal: true

module Threesixty
  class EmailTemplateForm < Rectify::Form
    attribute :from, String
    attribute :reply_to_email, String
    attribute :subject, String
    attribute :content, String
<<<<<<< HEAD
    attribute :meta, Hash

    validates :from, :reply_to_email, presence: true
    validates :reply_to_email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
=======

    validates :from, :reply_to_email, presence: true
>>>>>>> Backed fo email template
  end
end
