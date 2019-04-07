# frozen_string_literal: true

FactoryGirl.define do
  factory :threesixty_subject, class: 'Threesixty::Subject' do
    user
    campaign
  end
end
