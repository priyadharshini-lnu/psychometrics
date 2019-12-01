# frozen_string_literal: true

module Threesixty
  module Campaign
    class CreateEmptyCampaign < BaseCommand
      attr_reader :campaign

      def initialize(form)
        @campaign = Threesixty::Campaign.Build.call!(form)
      end

      def call
        dimension = Dimension.create!(
          name: "#{campaign.campaign.name} Dimension",
          owner_id: campaign.campaign.project_id
        )
        assessment = Assessment.new(name: "#{campaign.campaign.name} Assessment",
                                    dimension_id: dimension.id,
                                    type: Assessment::TYPES[:common],
                                    category: Assessment::CATEGORIES[:threesixty])
        assessment.set_default_color
        assessment.save!
        report = Report.new(name: "#{campaign.campaign.name} Report",
                            owner_id: campaign.campaign.project_id,
                            assessment_id: assessment.id,
                            category: Assessment::CATEGORIES[:threesixty])
        report.set_default_color
        report.assessments << assessment
        report.save!
        campaign.assessment_id = assessment.id
        campaign.report_id = report.id
        campaign.save!

        broadcast :ok, campaign
      end
    end
  end
end
