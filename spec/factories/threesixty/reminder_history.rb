# frozen_string_literal: true

FactoryGirl.define do
  factory :threesixty_reminder_history, class: 'Threesixty::ReminderHistory' do
    threesixty_campaign
  end
end
