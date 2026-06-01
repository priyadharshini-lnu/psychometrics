# frozen_string_literal: true

FactoryBot.define do
  factory :client do
    sequence(:name) { |i| "Client #{i}" }
    sequence(:subdomain) { |i| "client#{i}" }

    factory :tenancy do
      transient do
        with_license { true }
      end

      parent { nil }
      sequence(:name) { |i| "Client Tenancy #{i}" }
      sequence(:number) { |i| "Number #{i}" }
      year { Time.zone.now.year }
      country { 'Barbados' }
      association :project_manager, factory: :superadmin
      sequence(:subdomain) { |i| "tenancy#{i}" }
      after(:create) do |tenancy, evaluator|
        create :license, client: tenancy if evaluator.with_license
      end
    end

    # applicable_levels
    trait :project_level do
      applicable_level { :project }
    end

    trait :campaign_level do
      applicable_level { :campaign }
    end

    trait :sub_campaign_level do
      applicable_level { :sub_campaign }
    end

    trait :_end_level do
      end_level { true }
    end

    trait :with_reports do
      transient do
        with_assessments { create_list(:assessment, 1) }
      end

      after(:create) do |client, evaluator|
        assessments = evaluator.with_assessments
        report_family = client.root.report_families.take
        report = create(:report, report_families: [report_family], assessments: assessments)
        client.assessments = report.assessments
      end
    end

    factory :project_base, traits: [:with_reports] do
      association :parent, factory: :tenancy
      sequence(:name) { |i| "Project #{i}s#{rand(1..100)}" }
      sequence(:subdomain) { |i| "test#{i}s#{rand(1..100)}" }
      sequence(:number) { |i| "Number #{i}s#{rand(1..100)}" }
    end

    factory :project, parent: :project_base, traits: %i[project_level _end_level]

    factory :project_with_sms_notification, parent: :project do
      after(:create) do |project|
        project.client.client_feature&.update(sms_notification: true)
        project.project_feature&.update(sms_notification: true)
      end
    end

    factory :campaign_base, traits: [:with_reports] do
      end_level { true }
      association :parent, factory: %i[project_base sub_campaign_level]
      sequence(:subdomain) { |i| "campaign#{i}" }
      sequence(:name) { |i| "Campaign #{i}" }
    end

    factory :client_campaign, parent: :campaign_base do
      association :parent, factory: %i[project_base campaign_level]
      _end_level
    end

    factory :sub_campaign do
      association :parent, factory: :campaign_base
      sequence(:subdomain) { |i| "subcampaign#{i}" }
      sequence(:name) { |i| "SubCampaign #{i}" }
      end_level { true }
    end
  end
end
