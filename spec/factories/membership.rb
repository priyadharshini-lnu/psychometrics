# frozen_string_literal: true

FactoryBot.define do
  factory :membership do
    user
    client factory: :project
    role { Membership::MEMBER_ROLE }

    trait :with_application_user do
      association :user, factory: :application_user
    end

    factory :client_admin_membership do
      association :user, factory: :user
      association :grants, factory: :membership_grants, data: AllowedPermissions::CLIENT_ADMIN_PERMISSIONS
      client factory: :tenancy
      role { Membership::CLIENT_ADMIN_ROLE }
    end

    factory :project_admin_membership do
      association :user, factory: :user
      association :grants, factory: :membership_grants, data: AllowedPermissions::PROJECT_ADMIN_PERMISSIONS
      client factory: %i[project sub_campaign_level]
      role { Membership::PROJECT_ADMIN_ROLE }
    end

    factory :campaign_admin_membership do
      association :user, factory: :user
      association :grants, factory: :membership_grants, data: AllowedPermissions::CAMPAIGN_ADMIN_PERMISSIONS
      campaign factory: :campaign
      role { Membership::CAMPAIGN_ADMIN_ROLE }

      transient do
        permissions { nil }
      end
    end

    factory :manager_membership do
      role { Membership::MANAGER_ROLE }
    end

    trait :for_campaign do
      client factory: :campaign_base
    end
  end
end
