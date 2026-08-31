# frozen_string_literal: true

FactoryBot.define do
  factory :user_saved_filter do
    sequence(:name) { |i| "Test filter #{i}" }
    resource_type { 'report_approvals_all' }
    filter_params { { 'filterable_fields' => 'test', 'with_resource_state' => 'active' } }
    favorite { false }

    user

    trait :favorite do
      favorite { true }
    end
  end
end
