# frozen_string_literal: true

FactoryBot.define do
  factory :data_report do
    name { Faker::Name.name }
    owner { create(:client) }
    report_type { :json_data_report }
    scope { :client }
    configuration do
      {
        sections: [{
          name: 'Section 1',
          columns: [{
            name: 'Column 1',
            type: 'user_detail',
            field_name: 'email'
          }]
        }]
      }.to_json
    end
    last_updated_by { create(:user) }

    trait :global do
      scope { :global }
      owner { nil }
    end
  end
end
