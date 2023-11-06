# frozen_string_literal: true

module Assessments
  module UniversalLink
    class Update < BaseCommand
      attr_reader :campaign, :assessment, :params

      def initialize(campaign, assessment, params)
        @campaign = campaign
        @assessment = assessment
        @params = params
      end

      def call
        return broadcast(:invalid) if assessment.external?

        campaign_assessment = campaign.campaign_assessments.find_by(assessment_id: assessment.id)
        campaign_assessment.update!(enable_universal_links: params[:active],
                                    allow_multiple_responses: params[:allow_multiple_responses])

        Generate.call!(@campaign, @assessment) unless campaign_assessment.has_valid_universal_link?

        broadcast(:ok, campaign_assessment.reload)
      end
    end
  end
end
