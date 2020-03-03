# frozen_string_literal: true

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
#  role                   :string           default("Users::Regular")
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
  factory :user do
    sequence(:email) { |n| "user+#{n}@example.com" }
    password 'Pass123$'
    role User::REGULAR_ROLE
    first_name 'test'
    last_name 'test'
    transient do
      memberships_options [{}]
    end

    factory :superadmin, class: 'Users::SuperAdmin' do
      role User::SUPER_ADMIN_ROLE
      first_name 'super'
      last_name 'admin'
    end

    factory :client_admin, traits: [:with_membership_client_admin] do
      role User::ADMIN_ROLE
    end
    factory :project_admin, traits: [:with_membership_project_admin] do
      role User::ADMIN_ROLE
    end
    factory :manager, traits: [:with_membership_manager]

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

    trait :skip_validate do
      to_create { |instance| instance.save(validate: false) }
    end
  end
end
