# frozen_string_literal: true

FactoryBot.define do
  factory :communication do
    sequence(:subject) { 'Test subject' }
    sequence(:body) { '<p> Test body </p>' }
    created_by { create(:user) }
    client do
      create(:tenancy, :campaign_level, name: 'Project',
                    subdomain: 'project-site',
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
    skip_owner_validation { true }
  end
end
