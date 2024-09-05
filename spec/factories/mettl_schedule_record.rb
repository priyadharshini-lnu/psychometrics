# frozen_string_literal: true

FactoryBot.define do
  factory :mettl_schedule_record do
    project
    assessment
    schedule_name { Faker::Name.name }
    schedule_id { 16_388_921 }
    access_key { '7bmicsn75s' }
    visual_proctoring_settings { { enabled: false, candidate_screen_capture: false, candidate_authorization: false } }
    web_proctoring_settings { { enabled: false, count: 5, show_remaining_counts: false } }
  end
end
