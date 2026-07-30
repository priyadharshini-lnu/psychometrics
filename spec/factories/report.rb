# frozen_string_literal: true

FactoryBot.define do
  factory :report do
    sequence(:name) { |i| "report #{i}" }
    description { Faker::Lorem.characters(number: 5) }
    extra { { icon_color: '#845EC2' } }
    report_families do
      family_owner_id = owner&.id || owner_id
      [association(:report_family, tenant_id: family_owner_id)]
    end
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

    trait :mhs do
      provider { 'mhs' }
      assessments { build_list(:assessment, 1, :mhs) }
      external_settings { { report_id: 'reportId' } }
    end

    trait :skillvue do
      provider { 'skillvue' }
      assessments { build_list(:assessment, 1, :skillvue) }
    end
  end
end
