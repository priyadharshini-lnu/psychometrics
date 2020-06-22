# frozen_string_literal: true

module Administration
  module Campaigns
    class TemplatesAndAssementsSerializer < ActiveModel::Serializer
      has_many :templates, serializer: Administration::Campaigns::TemplateSerializer
      has_many :assessments, serializer: Administration::Campaigns::ShortAssessmentSerializer

      def assessments
        object[:campaigns].map { |campaign| campaign.threesixty_campaign.assessment }
      end

      def templates
        object[:templates]
      end
    end
  end
end
