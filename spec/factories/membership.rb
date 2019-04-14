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
  factory :membership do
    user
    client factory: :project
    role Membership::MEMBER_ROLE

    factory :client_admin_membership do
      association :user, factory: :user
      association :grants, factory: :membership_grants, data: User::DEFAULT_ADMIN_GRANTS
      client factory: :tenancy
      role Membership::CLIENT_ADMIN_ROLE
    end

    factory :project_admin_membership do
      association :user, factory: :user
      association :grants, factory: :membership_grants, data: User::DEFAULT_PROJECT_ADMIN_GRANTS
      client factory: [:project, :sub_campaign_level]
      role Membership::PROJECT_ADMIN_ROLE
    end

    factory :manager_membership do
      role Membership::MANAGER_ROLE
    end

    trait :for_campaign do
      client factory: :campaign
    end
  end
end
