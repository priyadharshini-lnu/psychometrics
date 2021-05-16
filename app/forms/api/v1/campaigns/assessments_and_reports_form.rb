# frozen_string_literal: true

module Api
  module V1
    module Campaigns
      class AssessmentsAndReportsForm < Rectify::Form
        attribute :reports, Array
        attribute :assessments, Array

        validate :validate_reports
        validate :validate_assessments
        validate :validate_existed_reports
        validate :validate_existed_assessments

        def validate_existed_reports
          context.campaign.report_ids.each do |id|
            errors.add(:reports, "Report #{id} is already included to the campaign") if report_ids.include?(id)
          end
        end

        def validate_existed_assessments
          context.campaign.assessment_ids.each do |id|
            if assessment_ids.include?(id)
              errors.add(:assessments, "Assessment #{id} is already included to the campaign")
            end
          end
        end

        def validate_reports
          reports.each.with_index do |report, index|
            form = ReportForm.new(report)
            errors.add(:reports, "[Report #{index + 1}] #{form.errors.full_messages.first}") if form.invalid?
          end
        end

        def validate_assessments
          assessments.each.with_index do |assessment, index|
            possible_assessments = Report.where(id: report_ids).includes(:assessments).map(&:assessments).flatten
            form = AssessmentForm.new(assessment).with_context(assessments: possible_assessments)
            errors.add(:assessments, "[Assessment #{index + 1}] #{form.errors.full_messages.first}") if form.invalid?
          end
        end

        def assessment_ids
          assessment_map.keys
        end

        def assessment_map
          @assessment_map ||= assessments.index_by { |a| a[:id] }
        end

        def report_map
          @report_map ||= reports.index_by { |r| r[:id] }
        end

        def report_ids
          (report_map || {}).keys
        end

        def report_family_id
          nil
        end

        def operation
          'skip_existing'
        end

        def report_access
          {}
        end
      end
    end
  end
end
