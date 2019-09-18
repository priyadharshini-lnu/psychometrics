# frozen_string_literal: true

class Threesixty::EmailHistory < ApplicationRecord
  belongs_to :threesixty_campaign, class_name: 'Threesixty::Campaign'
  belongs_to :email_schedule, class_name: 'Threesixty::EmailSchedule', foreign_key: :threesixty_email_schedule_id

  def recipient_type
    config = Threesixty::Emails::Send::CONFIG.find { |c| c[:template_name] == name }
    config&.dig(:recipient_type)
  end
end
