# frozen_string_literal: true

FactoryBot.define do
  factory :mettl_schedule do
    project
    assessment
    schedule_id { 16_388_921 }
    access_key { '7bmicsn75s' }
  end
end
