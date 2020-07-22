# frozen_string_literal: true

module Assessments
  module UniversalLink
    class Disable < BaseCommand
      attr_reader :campaign, :assessment

      def initialize(campaign, assessment)
        @campaign = campaign
        @assessment = assessment
      end

      def call
        return broadcast(:invalid) if assessment.external?

        campaign_assessment = campaign.campaign_assessments.find_by(assessment_id: assessment.id)
        campaign_assessment.update!(enable_universal_links: false)

        broadcast(:ok, campaign_assessment)
      end
    end
  end
end
