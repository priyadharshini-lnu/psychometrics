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
    sequence(:name) { |i| "Client Tenancy #{i}" }
    sequence(:subdomain) { |i| "test-#{i}" }
    parent nil

    transient do
      no_license false
      sub_clients_count false
    end

    after(:create) do |record, evaluator|
      if record.tenancy? && !evaluator.no_license
        (License.types.keys - %w(assign_individual_assessment assign_individual_report)).each do |name|
          create :license, name.to_sym, client: record
        end
      end

      if record.tenancy? && evaluator.sub_clients_count
        evaluator.sub_clients_count.times do
          create :client, parent_id: record.id
        end
      end
    end
  end
end
