# frozen_string_literal: true

FactoryBot.define do
  factory :meeting_room do
    sequence(:name) { |n| "Meeting Room #{n}" }
    meetable { association :workshop }
  end
end
