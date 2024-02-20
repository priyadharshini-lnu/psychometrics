# frozen_string_literal: true

module Administration
  module Campaigns
    class ShortAssessmentSerializer < Panko::Serializer
      attributes :id, :name
    end
  end
end
