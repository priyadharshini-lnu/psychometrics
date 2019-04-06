# frozen_string_literal: true

FactoryGirl.define do
  factory :threesixty_subject, class: 'Threesixty::Subject' do
    campaigns_user
    campaign
  end
end
