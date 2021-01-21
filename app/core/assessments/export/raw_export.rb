# frozen_string_literal: true

module Assessments
  module Export
    class RawExport < BaseCommand
      private_attr_accessor :assessment, :campaign, :options

      def initialize(assessment, campaign, options = {})
        @assessment = assessment
        @campaign = campaign
        @options = options
      end

      def call
        xlsx = if assessment.agile?
                 ::Assessments::Export::AgileRaw.call!(
                   assessment, campaign
                 )
               else
                 ::Assessments::Export::RawAndScoring.call!(
                   assessment, campaign, options
                 )
               end

        broadcast :ok, xlsx
      end
    end
  end
end
