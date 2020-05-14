# frozen_string_literal: true

FactoryBot.define do
  factory :threesixty_evaluator, class: 'Threesixty::Evaluator' do
    user
    campaign
  end
end
