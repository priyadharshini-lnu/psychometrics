# frozen_string_literal: true

module Administration
  module Clients
    class AssignReportsForm < Rectify::Form
      # Fields
      attribute :report_family_id, Integer
      attribute :report_ids, Array[Integer]
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
        report_family = ReportFamily.find(report_family_id)
        report_family_report_ids = report_family.report_ids
        errors.add(:report_ids, :invalid) unless report_ids.all? { |id| report_family_report_ids.include?(id) }
      end

    end
  end
end
