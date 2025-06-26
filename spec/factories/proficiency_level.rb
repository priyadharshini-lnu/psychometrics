# frozen_string_literal: true

FactoryBot.define do
  factory :proficiency_level do
    association :project, factory: :project
    association :skill

    proficiency_type { 'all_skills' }
    level { 2 }
    skill_category { 'technical' }
    level_definition { 'Basic understanding' }
  end
end
