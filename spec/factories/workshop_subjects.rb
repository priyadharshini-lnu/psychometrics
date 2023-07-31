# frozen_string_literal: true

FactoryBot.define do
  factory :workshop_subject do
    workshop
    user
    attended { false }
    status { 'not_started' }
  end
end
