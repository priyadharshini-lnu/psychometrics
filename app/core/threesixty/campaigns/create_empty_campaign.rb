# frozen_string_literal: true

module Threesixty
  module Campaigns
    class CreateEmptyCampaign < BaseCommand
      private_attr_reader :threesixty_campaign, :project

      def initialize(form, project)
        @threesixty_campaign = ::Threesixty::Campaigns::Build.call!(form, project)
        @project = project
      end

      def call
        dimension = Dimension.create!(
          name: "#{threesixty_campaign.name} Dimension",
          owner_id: project.id
        )
        assessment = Assessment.new(name: "#{threesixty_campaign.name} Assessment",
                                    dimension_id: dimension.id,
                                    type: Assessment::TYPES[:common],
                                    category: Assessment::CATEGORIES[:threesixty])
        assessment.set_default_color
        assessment.save!
        report = Report.new(name: "#{threesixty_campaign.name} Report",
                            owner_id: project.id,
                            assessment_id: assessment.id,
                            category: Assessment::CATEGORIES[:threesixty])
        report.set_default_color
        report.assessments << assessment
        report.save!
        threesixty_campaign.assessment_id = assessment.id
        threesixty_campaign.report_id = report.id
        threesixty_campaign.save!

        broadcast :ok, threesixty_campaign
      end
    end
  end
end
