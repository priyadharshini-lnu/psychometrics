# frozen_string_literal: true

FactoryBot.define do
  factory :proctoring_session do
    session_id { '' }
    campaign_user { nil }
    started_at { '2020-10-15 15:56:40' }
    completed_at { '2020-10-15 15:56:40' }
    status { 1 }
    results { '' }
  end
end
