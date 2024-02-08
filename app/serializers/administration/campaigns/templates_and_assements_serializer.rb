# frozen_string_literal: true

module Administration
  module Campaigns
    class TemplatesAndAssementsSerializer < Panko::Serializer
      attributes :assessments, :templates

      def assessments
        Panko::ArraySerializer.new(
          object[:campaigns].map { |campaign| campaign.threesixty_campaign.assessment },
          each_serializer: Administration::Campaigns::ShortAssessmentSerializer
        ).to_a
      end

      def templates
        Panko::ArraySerializer.new(
          object[:templates],
          each_serializer: Administration::Campaigns::TemplateSerializer
        ).to_a
      end
    end
  end
end
