# frozen_string_literal: true

module Clients
  module AssignReports
    class AssignReportForm < Rectify::Form
      # Fields
      attribute :report_family_id, Integer
      attribute :report_ids, Array[Integer]
      attribute :remove_report_ids, Array[Integer]
      attribute :user_access_report_ids, Array[Integer]
      attribute :apply_to_existing_users, Boolean

      #   VALIDATIONS
      #
      validates :report_family_id, presence: true
      validates :report_ids, presence: true, if: -> { context.new_record }
      validate :report_family_enabled, if: -> { context.new_record }
      validate :reports_enabled, if: -> { report_ids.any? }
      validate :reports_linked_to_report_family, if: -> { report_family_id && report_ids.any? }

      protected

      # Returns error if License with Report Family is disabled
      #
      def report_family_enabled
        errors.add(:report_ids, :invalid) if ::ReportFamily.
                                             joins(:licenses).
                                             where(licenses: { disabled: true, client_id: context.client_tenancy.id }).
                                             where(id: report_family_id).
                                             exists?
      end

      # Returns error if there is at least one disabled Report
      #
      def reports_enabled
        errors.add(:report_ids, :invalid) if ::Report.disabled.exists?(id: report_ids)
      end

      # Returns error if there is a Report not from Report Family
      #
      def reports_linked_to_report_family
        report_family_report_ids = ReportFamily.find(report_family_id).report_ids.to_set
        errors.add(:report_ids, :invalid) unless report_ids.to_set.subset?(report_family_report_ids)
        errors.add(:remove_report_ids, :invalid) unless remove_report_ids.to_set.subset?(report_family_report_ids)
      end
    end
  end
end
