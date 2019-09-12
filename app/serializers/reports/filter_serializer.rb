# frozen_string_literal: true

# == Schema Information
#
# Table name: reports_filters
#
#  id         :integer          not null, primary key
#  report_id  :integer
#  name       :string
#  conditions :json
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

module Reports
  class FilterSerializer < ActiveModel::Serializer
    attributes :id, :name, :conditions, :assessment_id
  end
end
