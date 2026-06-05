# frozen_string_literal: true

FactoryBot.define do
  factory :microsite_assessment do
    sequence(:product_id) { |n| "ms-assessment-#{n}" }
    name { 'Test Assessment' }
    metadata { { 'description' => 'A test assessment' } }
    association :project
  end
end
