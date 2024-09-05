# frozen_string_literal: true

FactoryBot.define do
  factory :mettl_schedule_record do
    project
    assessment
    schedule_name { Faker::Name.name }
    schedule_id { 16_388_921 }
    access_key { '7bmicsn75s' }
  end
end
