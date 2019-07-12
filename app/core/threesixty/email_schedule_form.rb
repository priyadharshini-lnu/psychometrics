
# frozen_string_literal: true

module Threesixty
  class EmailScheduleForm < Rectify::Form
    attribute :name, String
    attribute :from, String
    attribute :reply_to_email, String
    attribute :subject, String
    attribute :content, String
    attribute :recipient_criteria, Array
    attribute :scheduled_date, DateTime

    validates :from, :reply_to_email, presence: true
    validates :reply_to_email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
  end
end
