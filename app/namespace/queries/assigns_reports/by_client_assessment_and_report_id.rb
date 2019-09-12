# frozen_string_literal: true

module Queries
  module AssignsReports
    class ByClientAssessmentAndReportId < ::Queries::Base
      def initialize(relation = AssignsReport.all)
        @relation = relation
      end

      def call(client_id, assessment_id, report_id)
        @relation = AssignsReport.
                    joining { assign.membership.user }.
                    joining { assign.membership.project_membership.hogan_credential }.
                    joining { assign.assessment }.
                    joining { report }.
                    where.has { assign.membership.client_id.eq(client_id) }.
                    where.has { assign.assessment.id.eq(assessment_id) }.
                    where.has { report.id.eq(report_id) }
      end
    end
  end
end
