# frozen_string_literal: true

FactoryGirl.define do
  factory :threesixty_option, class: 'Threesixty::Option' do
    threesixty_campaign
    participants { {} }
    reports { {} }
  end
end
