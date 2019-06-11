# frozen_string_literal: true

FactoryGirl.define do
  factory :threesixty_nomination_requirement, class: 'Threesixty::NominationRequirement' do
    position { 1 }
    sequence(:name) { |i| "Req #{i}" }
  end
end
