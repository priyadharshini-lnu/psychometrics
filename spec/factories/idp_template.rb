# frozen_string_literal: true

FactoryBot.define do
  factory :idp_template do
    name { Faker::Lorem.characters(number: 8) }
    description { 'IDP Template 1 Description' }
    available_skills_selection_type { :selected }
    available_development_actions_selection_type { :selected }
    suggested_development_actions_selection_type { :all }
    skill_gap_datasheet_columns { ['Job Title', 'Department', 'Location'] }
    skill_gap_profile_field_names { %w[first_name last_name] }
  end
end
