# frozen_string_literal: true

module Assessments
  module UniversalLink
    class Enable < BaseCommand
      attr_reader :campaign, :assessment

      def initialize(campaign, assessment)
        @campaign = campaign
        @assessment = assessment
      end

      def call
        return broadcast(:invalid) if assessment.external?

        campaign_assessment = campaign.campaign_assessments.find_by(assessment_id: assessment.id)
        campaign_assessment.update!(enable_universal_links: true)
        Generate.call!(@campaign, @assessment) unless campaign_assessment.has_valid_universal_link?

        broadcast(:ok, campaign_assessment.reload)
      end
    end
  end
end
