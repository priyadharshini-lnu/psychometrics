# frozen_string_literal: true

FactoryBot.define do
  factory :proficiency_level do
    association :project, factory: :project
    association :skill

    proficiency_type { 'default' }
    level { 2 }
    skill_type { 'technical' }
    level_definition { 'Basic understanding' }
  end
end
