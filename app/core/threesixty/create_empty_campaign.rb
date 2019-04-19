module Threesixty
  class CreateEmptyCampaign < Rectify::Command
    attr_reader :campaign

    def initialize(campaign)
      @campaign = campaign
    end

    def call
      dimension = Dimension.create(name: "#{@campaign.campaign.name} Dimension", owner_id: @campaign.campaign.project_id)
      assessment = Assessment.create(name: "#{@campaign.campaign.name} Assessment",
                                     dimension_id: dimension.id,
                                     type: Assessment::TYPES[:common],
                                     category: Assessment::CATEGORIES["360"])
      report = Report.new(name: "#{@campaign.campaign.name} Report",
                             owner_id: @campaign.campaign.project_id,
                             assessment_id: assessment.id)
      report.assessments << assessment
      report.save
      @campaign.assessment_id = assessment.id
      @campaign.report_id = report.id
      broadcast :ok, @campaign
    end
  end
end
