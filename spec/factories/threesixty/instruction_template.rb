# frozen_string_literal: true

FactoryBot.define do
  factory :threesixty_instruction_template, class: 'Threesixty::InstructionTemplate' do
    threesixty_campaign
    name { Faker::Lorem.characters(number: 5) }
    content { Faker::Lorem.sentence }
  end
end
