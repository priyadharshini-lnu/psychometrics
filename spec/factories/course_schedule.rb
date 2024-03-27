# frozen_string_literal: true

FactoryBot.define do
  factory :course_schedule do
    development_action { create(:development_action) }
    start_date_time { Time.zone.now }
    end_date_time { 1.day.from_now }
  end
end
