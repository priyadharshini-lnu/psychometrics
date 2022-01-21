# frozen_string_literal: true

# == Schema Information
#
# Table name: assessments
#
#  id                :integer          not null, primary key
#  name              :string
#  category          :enum             default("psychometric")
#  dimension_id      :integer
#  disabled          :boolean          default(FALSE)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  flow              :json
#  norm_rules        :json
#  description       :text
#  timing            :string
#  access_reports_at :datetime
#  status            :integer
#

FactoryBot.define do
  factory :report do
    sequence(:name) { |i| "report #{i}" }
    description { Faker::Lorem.characters(5) }
    extra { { icon_color: '#845EC2' } }
    report_families { [association(:report_family)] }
    assessments { build_list(:assessment, 1) }

    trait :saville do
      provider { 'saville' }

      after(:create) do |report|
        create(:saville_report_setting, report: report)
        report.update_column(:provider, :saville)
      end
    end
  end
end
