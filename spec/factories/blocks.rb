# frozen_string_literal: true

# == Schema Information
#
# Table name: blocks
#
#  id            :integer          not null, primary key
#  name          :string
#  position      :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  assessment_id :integer
#  deleted_at    :datetime
#  props         :json
#  view          :integer          default("assessments")
#  disabled      :boolean          default(FALSE)
#  template_id   :integer
#

FactoryGirl.define do
  factory :block do
    sequence(:name) { |i| "block #{i}" }
  end
end
