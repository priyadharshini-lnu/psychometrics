# frozen_string_literal: true

FactoryBot.define do
  factory :threesixty_email_history, class: 'Threesixty::EmailHistory' do
    threesixty_email_schedule
  end
end
