# frozen_string_literal: true

module Administration
  module Campaigns
    class ShortAssessmentSerializer < Panko::Serializer
      attributes :id, :name, :skill_rater

      def skill_rater
        object.skill_rater?
      end
    end
  end
end
