# frozen_string_literal: true

FactoryGirl.define do
  factory :threesixty_evaluator, class: 'Threesixty::Evaluator' do
    user
    campaign
  end
end
