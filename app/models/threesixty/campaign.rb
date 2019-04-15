module Threesixty
  class Campaign < ApplicationRecord
    belongs_to :campaign
    belongs_to :assessment
    belongs_to :report

    before_create :create_dependencies
    attr_accessor :factors

    def attribute_names
      super + [:factors]
    end

    def create_dependencies
      if assessment.present?
        create_campaign_from_assessment
      else
        create_empty_campaign
      end
    end

    def create_campaign_from_assessment
      Threesixty::CreateFromAssessment.call(self)
    end

    def create_empty_campaign
      dimension = Dimension.create(name: "#{campaign.name} Dimension", owner_id: campaign.project_id)
      assessment = Assessment.create(name: "#{campaign.name} Assessment",
                                     dimension_id: dimension.id,
                                     type: Assessment::TYPES[:common],
                                     category: Assessment::CATEGORIES["360"])
      report = Report.new(name: "#{campaign.name} Report",
                             owner_id: campaign.project_id,
                             assessment_id: assessment.id)
      report.assessments << assessment
      report.save
      self.assessment_id = assessment.id
      self.report_id = report.id
    end
  end
end
