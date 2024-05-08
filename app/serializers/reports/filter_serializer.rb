# frozen_string_literal: true

module Reports
  class FilterSerializer < Panko::Serializer
    attributes :id, :name, :conditions, :assessment_id, :min_required_responses
  end
end
