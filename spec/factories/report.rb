# frozen_string_literal: true

FactoryBot.define do
  factory :report do
    sequence(:name) { |i| "report #{i}" }
    description { Faker::Lorem.characters(number: 5) }
    extra { { icon_color: '#845EC2' } }
    report_families { [association(:report_family)] }
    assessments { build_list(:assessment, 1) }

    trait :saville do
      provider { 'saville' }

      after(:create) do |report|
        create(:saville_report_setting, report: report)
        report.update_column(:provider, :saville)
      end
    end
  end
end
