# frozen_string_literal: true

FactoryBot.define do
  factory :communication_template do
    sequence(:name) { |i| "Communication Template #{i}" }
    kind { :invitation }
    level { :campaign }
    status { :draft }

    client { create(:tenancy) }
    project { create(:project, parent: client) }
    campaign { create(:campaign, project: project) }

    recipients_default { :all }
    delivery_defaults { {} }

    association :created_by, factory: :superadmin
    association :updated_by, factory: :superadmin
  end
end
