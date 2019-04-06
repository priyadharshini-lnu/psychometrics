# == Schema Information
#
# Table name: users
#
#  id                     :integer          not null, primary key
#  email                  :string           default(""), not null
#  encrypted_password     :string           default(""), not null
#  reset_password_token   :string
#  reset_password_sent_at :datetime
#  remember_created_at    :datetime
#  sign_in_count          :integer          default(0), not null
#  current_sign_in_at     :datetime
#  last_sign_in_at        :datetime
#  current_sign_in_ip     :inet
#  last_sign_in_ip        :inet
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  first_name             :string
#  last_name              :string
#  disabled               :boolean          default(FALSE)
#  role                   :string           default("Users::Member")
#  invitation_token       :string
#  invitation_created_at  :datetime
#  invitation_sent_at     :datetime
#  invitation_accepted_at :datetime
#  invitation_limit       :integer
#  invited_by_type        :string
#  invited_by_id          :integer
#  invitations_count      :integer          default(0)
#  authentication_token   :string(30)
#  is_anonym              :boolean          default(FALSE)
#

FactoryGirl.define do
  factory :client do
    sequence(:name) { |i| "Client #{i}" }

    factory :tenancy do
      parent nil
      sequence(:name) { |i| "Client Tenancy #{i}" }
      sequence(:number) { |i| "Number #{i}" }
      year { Time.now.year }
      country 'Barbados'
      association :project_manager, factory: :superadmin
      association :account_manager, factory: :superadmin
      after(:create) do |tenancy, _evaluator|
        create :license, client: tenancy
      end
    end

    # applicable_levels
    trait :project_level do
      applicable_level :project
    end

    trait :campaign_level do
      applicable_level :campaign
    end

    trait :sub_campaign_level do
      applicable_level :sub_campaign
    end

    trait :_end_level do
      end_level true
    end

    trait :with_reports do
      after(:create) do |client, _evaluator|
        report_family = client.root.report_families.take
        report = create(:report, report_families: [report_family])
        create :clients_report, client: client, report: report, report_family: report_family
        client.assessment_ids = report.assessment_ids
      end
    end

    factory :project_base, traits: [:with_reports] do
      association :parent, factory: :tenancy
      sequence(:name) { |i| "Project #{i}" }
      sequence(:subdomain) { |i| "test-#{i}" }
      sequence(:number) { |i| "Number #{i}" }
    end

    factory :project, parent: :project_base, traits: [:project_level, :_end_level]

    factory :campaign_base do
      association :parent, factory: [:project_base, :sub_campaign_level]
      sequence(:name) { |i| "Campaign #{i}" }
    end

    factory :client_campaign, parent: :campaign_base do
      association :parent, factory: [:project_base, :campaign_level]
      _end_level
    end

    factory :sub_campaign do
      association :parent, factory: :campaign_base
      sequence(:name) { |i| "SubCampaign #{i}" }
      end_level true
    end
  end
end
