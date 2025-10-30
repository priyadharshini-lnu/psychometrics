# frozen_string_literal: true

FactoryBot.define do
  factory :project_license do
    project
    license
    usage_limit { 10 }
    used_number { 0 }
    enabled { true }
  end
end
