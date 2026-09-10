# frozen_string_literal: true

FactoryBot.define do
  factory :bulk_report_job do
    association :project
    association :created_by, factory: :user
    association :bulk_report

    start_date { 2.weeks.ago }
    end_date   { Time.zone.now }
  end
end
