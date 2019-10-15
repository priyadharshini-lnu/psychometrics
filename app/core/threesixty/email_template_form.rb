# frozen_string_literal: true

module Threesixty
  class EmailTemplateForm < Rectify::Form
    attribute :from, String
    attribute :reply_to_email, String
    attribute :subject, String
    attribute :content, String
    attribute :meta, Hash

    validates :from, :reply_to_email, presence: true
    validates :reply_to_email, format: { with: Devise.email_regexp }, allow_blank: true
  end
end
