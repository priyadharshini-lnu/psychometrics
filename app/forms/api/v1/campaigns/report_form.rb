# frozen_string_literal: true

module Api
  module V1
    module Campaigns
      class ReportForm < Rectify::Form
        attribute :id, Integer
        attribute :user_access, Boolean
        attribute :report_bundle_id, Integer

        validates :id, :report_bundle_id, presence: true
        validates :user_access, inclusion: { in: [true, false] }

        validate :validate_report_id
        validate :validate_report_bundle_id

        private

        def validate_report_id
          return unless report_bundle
          return if report_bundle.reports.exists?(id: id)

          errors.add(:id, 'Invalid report id')
        end

        def validate_report_bundle_id
          errors.add(:report_bundle_id, 'Invalid report_bundle_id') unless report_bundle
        end

        def report_bundle
          @report_bundle ||= ReportFamily.find_by(id: report_bundle_id)
        end
      end
    end
  end
end
