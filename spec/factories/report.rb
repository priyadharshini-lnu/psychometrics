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

FactoryGirl.define do
  factory :report do
    sequence(:name) { |i| "report #{i}" }
    extra { { icon_color: '#845EC2' } }
    report_families { [association(:report_family)] }
    assessments { build_list(:assessment, 1) }
  end
end
