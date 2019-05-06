# frozen_string_literal: true

module Clients
  module Reports
    class AssignReportForm < Rectify::Form
      include Virtus.model(:nullify_blank => true)

      # Fields
      attribute :report_family_id, Integer
      attribute :adding_report_ids, Array[Integer]
      attribute :removing_report_ids, Array[Integer]
      attribute :adding_user_access_report_ids, Array[Integer]
      attribute :removing_user_access_report_ids, Array[Integer]
      attribute :is_applying_to_existing_users, Boolean

      #   VALIDATIONS
      #
      validates :report_family_id, presence: true
      validates :adding_report_ids, presence: true, if: -> { context.new_record }
      validate :report_family_enabled, if: -> { context.new_record }
      validate :reports_enabled, if: -> { adding_report_ids.any? }
      validate :reports_linked_to_report_family, if: -> { report_family_id && adding_report_ids.any? }

      def initialize(opts={})
        super
        @removing_user_access_report_ids = [] if removing_user_access_report_ids.reject(&:blank?).blank?
      end

      protected

      # Returns error if License with Report Family is disabled
      #
      def report_family_enabled
        errors.add(:adding_report_ids, :report_family_disabled) if ::ReportFamily.
                                                                  joins(:licenses).
                                                                  where(licenses: { disabled: true, client_id: context.client_tenancy.id }).
                                                                  where(id: report_family_id).
                                                                  exists?
      end

      # Returns error if there is at least one disabled Report
      #
      def reports_enabled
        errors.add(:adding_report_ids, :reports_disabled) if ::Report.disabled.exists?(id: adding_report_ids)
      end

      # Returns error if there is a Report not from Report Family
      #
      def reports_linked_to_report_family
        report_family_report_ids = ReportFamily.find(report_family_id).report_ids.to_set
        errors.add(:adding_report_ids, :not_linked_to_report_family) unless adding_report_ids.to_set.subset?(report_family_report_ids)
        errors.add(:removing_report_ids, :not_linked_to_report_family) unless removing_report_ids.to_set.subset?(report_family_report_ids)
      end
    end
  end
end
