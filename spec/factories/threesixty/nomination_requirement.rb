# frozen_string_literal: true

FactoryGirl.define do
  factory :threesixty_nomination_requirement, class: 'Threesixty::NominationRequirement' do
    name { 'Requirement1' }
    position { 1 }
  end
end
