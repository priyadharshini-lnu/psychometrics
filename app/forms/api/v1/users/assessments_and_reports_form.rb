# frozen_string_literal: true

module Api
  module V1
    module Users
      class AssessmentsAndReportsForm < Api::V1::Campaigns::AssessmentsAndReportsForm
        def validate_existed_reports
          context.campaign_user.campaign_user_reports.each do |user_report|
            next unless report_ids.include?(user_report.report_id)

            errors.add(:reports, "Report #{user_report.report_id} is already included to the campaign")
          end
        end

        def validate_existed_assessments
          context.campaign_user.campaign_user_assessments.each do |user_assessment|
            next unless assessment_ids.include?(user_assessment.assessment_id)

            errors.add(
              :assessments, "Assessment #{user_assessment.assessment_id} is already included to the campaign"
            )
          end
        end

        def operation
          'add_and_allow_new_response'
        end

        def add_and_allow_new_response?
          true
        end
      end
    end
  end
end
