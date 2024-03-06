# frozen_string_literal: true

FactoryBot.define do
  factory :membership do
    user
    client factory: :project
    role { Membership::MEMBER_ROLE }

    factory :client_admin_membership do
      association :user, factory: :user
      association :grants, factory: :membership_grants, data: User::DEFAULT_ADMIN_GRANTS
      client factory: :tenancy
      role { Membership::CLIENT_ADMIN_ROLE }
    end

    factory :project_admin_membership do
      association :user, factory: :user
      association :grants, factory: :membership_grants, data: User::DEFAULT_PROJECT_ADMIN_GRANTS
      client factory: %i[project sub_campaign_level]
      role { Membership::PROJECT_ADMIN_ROLE }
    end

    factory :campaign_admin_membership do
      association :user, factory: :user
      grants do
        association :membership_grants, data: (permissions || AllowedPermissions::CAMPAIGN_ADMIN_PERMISSIONS)
      end
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
