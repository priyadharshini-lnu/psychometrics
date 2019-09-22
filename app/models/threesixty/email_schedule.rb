# frozen_string_literal: true

class Threesixty::EmailSchedule < ApplicationRecord
  belongs_to :threesixty_campaign, class_name: 'Threesixty::Campaign'
  has_many :email_histories, class_name: 'Threesixty::EmailHistory', foreign_key: :threesixty_email_schedule_id,
            dependent: :destroy

  def recipient_type
    config = Threesixty::Emails::Send::CONFIG.find { |c| c[:template_name] == name }
    config&.dig(:recipient_type)
  end

  def recipients
    User.where(id: recipient_ids)
  end
end
