# frozen_string_literal: true

module Administration
  module Clients
    class MembershipForm < Rectify::Form
      # attribute :new_record, Boolean, default: true

      # Fields
      attribute :parent_id, Integer
      attribute :role, String
      attribute :hris_data, Hash[Symbol => String]

      attribute :first_name, String
      attribute :last_name, String
      attribute :email, String

      #   VALIDATIONS
      #
      validates :role, inclusion: { in: Membership::MEMBERSHIP_ROLES }, presence: true
      validates :report_family_id, presence: true
      validates :report_ids,       presence: true, if: proc { new_record? }
      validate :report_family_enabled
      validate :reports_enabled
      validate :reports_linked_to_report_family

      protected

      # Returns error if License with Report Family is disabled
      #
      def report_family_enabled
        errors.add(:report_ids, :invalid) if ::ReportFamily.
                                             joins(:licenses).
                                             where(licenses: { disabled: true, client_id: context.client.id }).
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
        errors.add(:report_ids, :invalid) if ::Report.
                                             enabled.
                                             joins(:report_families).
                                             where(id: report_ids).
                                             where.not(report_families: { id: report_family_id }).
                                             exists?
      end

    end
  end
end
