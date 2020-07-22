# frozen_string_literal: true

module Assessments
  module UniversalLink
    class Generate < BaseCommand
      attr_reader :campaign, :assessment

      def initialize(campaign, assessment)
        @campaign = campaign
        @assessment = assessment
      end

      def call
        return broadcast(:invalid) if assessment.external?

        campaign_assessment = campaign.campaign_assessments.find_by(assessment_id: assessment.id)
        campaign_assessment.update!(
          assessment_key: generate_random_key,
          key_generated_at: Time.now
        )

        broadcast(:ok, campaign_assessment)
      end

      private

      def generate_random_key(length = 16, with_padding = false)
        SecureRandom.urlsafe_base64(length, with_padding)
      end
    end
  end
end
