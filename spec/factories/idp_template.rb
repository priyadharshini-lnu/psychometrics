# frozen_string_literal: true

FactoryBot.define do
  factory :idp_template do
    name { Faker::Lorem.characters(number: 8) }
    description { 'IDP Template 1 Description' }
    available_development_actions_selection_type { :selected }
    suggested_development_actions_selection_type { :all }
    skill_gap_datasheet_columns { ['Job Title', 'Department', 'Location'] }
    skill_gap_profile_field_names { %w[first_name last_name] }
    behavioural_global_tags { %w[tag1 tag2] }
    behavioural_client_tags { %w[tag1 tag2] }
    technical_global_tags { %w[tag1 tag2] }
    technical_client_tags { %w[tag1 tag2] }
    self_rating_enabled { true }
    association :project
  end
end
