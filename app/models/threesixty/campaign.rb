module Threesixty
  class Campaign < ApplicationRecord
    belongs_to :campaign
    belongs_to :assessment
    belongs_to :report
    validates :assessment_id, presence: true

    before_create :copy_assessment_and_report

    def copy_assessment_and_report
      report = Assessment.find(assessment_id).reports.first.clone
      report.save
      assessment = CopyAssessment.process!(assessment_id)
      report.assessments << assessment
      report.assessment_id = assessment
      self.assessment_id = assessment.id
      self.report_id = report.id
    end
  end
end
