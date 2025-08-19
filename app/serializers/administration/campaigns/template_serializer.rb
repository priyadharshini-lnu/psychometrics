# frozen_string_literal: true

module Administration
  module Campaigns
    class TemplateSerializer < Panko::Serializer
      attributes :id, :name, :assessment_id, :owner_id, :campaign_id, :skill_rater

      def skill_rater
        object&.campaign&.skill_rater? || false
      end
    end
  end
end
