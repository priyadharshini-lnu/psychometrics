# frozen_string_literal: true

FactoryBot.define do
  factory :threesixty_option, class: 'Threesixty::Option' do
    threesixty_campaign
    participants { {} }
    reports { {} }
  end
end
