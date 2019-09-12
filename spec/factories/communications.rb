# frozen_string_literal: true

# == Schema Information
#
# Table name: communications
#
#  id                :integer          not null, primary key
#  subject           :string
#  body              :text
#  assessment_id     :integer
#  client_id         :integer
#  recipients        :integer          default("all")
#  disabled          :boolean          default(FALSE)
#  delivery_rule     :integer          default("on_specific_datetime")
#  delivery_at       :datetime
#  delivery_interval :string
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  owner_id          :integer
#

FactoryGirl.define do
  factory :communication do
    sequence(:subject) { 'Test subject' }
    sequence(:body) { '<p> Test body </p>' }
    creator { create(:user) }
    client do
      create(:tenancy, :campaign_level, name: 'Project',
                    subdomain: 'project',
                    number: 2,
                    applicable_level: 'project')
    end
    delivery_rule { 0 }
    delivery_at { nil }
    delivery_interval { nil }
    kind { 'invitation' }
    owner_id { create(:tenancy, :campaign_level) }
    end_level_id { Client.last }
    memberships { create_list(:membership, 5) }
  end
end
