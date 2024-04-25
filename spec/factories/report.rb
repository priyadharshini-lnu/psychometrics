# frozen_string_literal: true

FactoryBot.define do
  factory :report do
    sequence(:name) { |i| "report #{i}" }
    description { Faker::Lorem.characters(number: 5) }
    extra { { icon_color: '#845EC2' } }
    report_families { [association(:report_family)] }
    assessments { build_list(:assessment, 1) }
    provider { 'internal' }

    trait :saville do
      provider { 'saville' }
      assessments { build_list(:assessment, 1, :saville) }
      external_settings { { report_id: 'reportId' } }
    end

    trait :hogan do
      provider { 'hogan' }
      assessments { build_list(:assessment, 1, :hogan) }
      external_settings { { report_id: 'EcHDSLFCML' } }
    end
  end
end
