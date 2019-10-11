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
    attribute :recipient_ids, Array

    validates :from, :reply_to_email, :scheduled_date, presence: true
    validates :reply_to_email, format: { with: Devise.email_regexp }, allow_blank: true
  end
end
