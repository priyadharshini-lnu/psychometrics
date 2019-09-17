# frozen_string_literal: true

class Threesixty::EmailSchedule < ApplicationRecord
  belongs_to :threesixty_campaign, class_name: 'Threesixty::Campaign'

  def recipient_type
    config = Threesixty::Emails::Send::CONFIG.find { |c| c[:template_name] == name }
    config&.dig(:recipient_type)
  end
end
