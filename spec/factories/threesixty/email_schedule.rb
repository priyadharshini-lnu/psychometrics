# frozen_string_literal: true

FactoryGirl.define do
  factory :threesixty_email_schedule, class: 'Threesixty::EmailSchedule' do
    threesixty_campaign
    name { Faker::Lorem.characters(5) }
    from { Faker::Name.name }
    reply_to_email { Faker::Internet.email }
    content { Faker::Lorem.sentence }
  end
end
