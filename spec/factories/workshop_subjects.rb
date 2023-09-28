# frozen_string_literal: true

FactoryBot.define do
  factory :workshop_subject do
    workshop
    user
    campaign
    attended { false }
    attendance_status { 'no_status' }
    completion_status { 'not_started' }
  end
end
