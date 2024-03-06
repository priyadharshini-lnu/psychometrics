# frozen_string_literal: true

module CampaignUsers
  module AssignReportsAndAssessments
    module Import
      class CreateForm < Rectify::Form
        attribute :email, String
        attribute :report_bundle_id, Integer
        attribute :report_id, Integer
        attribute :assessment_id, Integer

        validate :report_presence
        validate :bundle_presence

        validate :validate_assessment_in_report
        validate :validate_report_in_bundle

        def report_presence
          report = context.reports_data[report_id]
          errors.add(:report_id, I18n.t('assign_reports.report_not_found', report_id: report_id)) unless report
        end

        def bundle_presence
          bundle = context.report_bundles_data[report_bundle_id]
          unless bundle
            errors.add(:report_id, I18n.t('assign_reports.report_bundle_not_found', bundle_id: report_bundle_id))
          end
        end

        def validate_assessment_in_report
          report = context.reports_data[report_id]&.at(0)

          unless report&.assessments_ids&.include?(assessment_id)
            errors.add(:assessment_id, I18n.t('assign_reports.assessment_not_in_report',
                                              assessment_id: assessment_id, report_id: report_id))
          end
        end

        def validate_report_in_bundle
          bundle = context.report_bundles_data[report_bundle_id]&.at(0)
          unless bundle&.reports_ids&.include?(report_id)
            errors.add(:report_id,
                       I18n.t('assign_reports.report_not_in_bundle', report_id: report_id, bundle_id: report_bundle_id))
          end
        end
      end
    end
  end
end
