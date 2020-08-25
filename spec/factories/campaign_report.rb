# frozen_string_literal: true

FactoryBot.define do
  factory :campaign_report do
    campaign
    report
    report_family
  end
end
