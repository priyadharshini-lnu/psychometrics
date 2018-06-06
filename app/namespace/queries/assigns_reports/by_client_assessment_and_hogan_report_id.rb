module Queries
  module AssignsReports
    class ByClientAssessmentAndHoganReportId < ::Queries::Base
      def initialize(relation = AssignsReport.all)
        @relation = relation
      end

      def call(client_id, assessment_id, hogan_report_id)
        @relation = AssignsReport.
                      joining { assign.membership.user }.
                      joining { assign.membership.project_membership.hogan_credential }.
                      joining { assign.assessment }.
                      joining { report.hogan_report_setting }.
                      where.has { assign.membership.client_id.eq(client_id) }.
                      where.has { assign.assessment.id.eq(assessment_id) }.
                      where.has { report.hogan_report_setting.hogan_report_id.eq(hogan_report_id) }
      end
    end
  end
end
