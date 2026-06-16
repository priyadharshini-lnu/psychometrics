# frozen_string_literal: true

FactoryBot.define do
  factory :user, class: 'Users::Regular' do
    sequence(:email) { |n| "user+#{n}.#{rand(1..100)}@example.com" }
    password { 'Password@Strong@129' }
    role { User::REGULAR_ROLE }
    first_name { 'test' }
    last_name { 'test' }
    transient do
      memberships_options { [{}] }
    end

    factory :superadmin, class: 'Users::SuperAdmin' do
      role { User::SUPER_ADMIN_ROLE }
      first_name { 'super' }
      last_name { 'admin' }
    end

    factory :client_admin, traits: [:with_membership_client_admin], class: 'Users::Admin' do
      role { User::ADMIN_ROLE }

      memberships { [association(:client_admin_membership, client: client)] }

      transient do
        client { create(:tenancy) }
      end
    end
    factory :project_admin, traits: [:with_membership_project_admin], class: 'Users::Admin' do
      role { User::ADMIN_ROLE }

      memberships { [association(:project_admin_membership, client: project)] }

      transient do
        project { create(:project) }
      end
    end

    factory :campaign_admin, traits: [:with_membership_project_admin], class: 'Users::Admin' do
      role { User::ADMIN_ROLE }

      memberships { [association(:campaign_admin_membership, campaign: campaign, permissions: permissions)] }

      transient do
        campaign { create(:campaign) }
        permissions { nil }
      end
    end

    factory :manager, traits: [:with_membership_manager]

    trait :with_membership_campaign_admin do
      memberships { memberships_options.map { |opts| association(:campaign_admin_membership, opts) } }
    end

    trait :with_membership_client_admin do
      memberships { memberships_options.map { |opts| association(:client_admin_membership, opts) } }
    end

    trait :with_membership_project_admin do
      memberships { memberships_options.map { |opts| association(:project_admin_membership, opts) } }
    end

    trait :with_membership_manager do
      memberships { memberships_options.map { |opts| association(:manager_membership, opts) } }
    end

    trait :with_membership_member do
      memberships { memberships_options.map { |opts| association(:membership, opts) } }
    end

    trait :with_project_membership do
      memberships { memberships_options.map { |opts| association(:membership, opts) } }
      project { memberships.first.client }
    end

    trait :skip_validate do
      to_create { |instance| instance.save(validate: false) }
    end

    trait :locked do
      locked_at { Time.zone.now }
      failed_attempts { 3 }
    end

    trait :with_photo do
      after(:create) do |user|
        user.user_profile.update(
          updated_at: Time.current,
          age: 1,
          gender: 1,
          timezone: 'MyString',
          locale: 'MyString'
        )

        user.user_profile.photo.attach(
          io: Rails.root.join('spec/fixtures/files/profile.png').open,
          filename: 'profile.png',
          content_type: 'image/png'
        )
      end
    end

    trait :assessor do
      role { User::ADMIN_ROLE }
      transient do
        with_campaign { nil }
      end

      after(:create) do |user, evaluator|
        attrs = { user: user }
        attrs[:campaign] = evaluator.with_campaign if evaluator.with_campaign
        create :assessor, attrs
      end
    end

    factory :application_user, class: 'Users::Application' do
      sequence(:first_name) { |n| "Application#{n}" }
      last_name { 'App' }
      role { User::APPLICATION_ROLE }

      transient do
        tenant { create(:tenancy) }
      end

      tenant_id { tenant.id }

      after(:create) do |user, evaluator|
        create(:membership, user: user, client: evaluator.tenant, role: Membership::CLIENT_ADMIN_ROLE)
      end
    end
  end
end
