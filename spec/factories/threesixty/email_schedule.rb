# frozen_string_literal: true

FactoryBot.define do
  factory :threesixty_email_schedule, class: 'Threesixty::EmailSchedule' do
    threesixty_campaign
    name { Faker::Lorem.characters(number: 5) }
    from { Faker::Name.name }
    reply_to_email { Faker::Internet.email }
    content { Faker::Lorem.sentence }
  end
end
