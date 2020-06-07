# frozen_string_literal: true

FactoryBot.define do
  factory :threesixty_subject, class: 'Threesixty::Subject' do
    user
    campaign
  end
end
