# frozen_string_literal: true

module Clients
  module Reports
    class AssignReport < AssignReportToMembership
      def initialize(form, client)
        @form = form
        @client = client
        @adding_reports = Report.includes(:assessments).where(id: form.adding_report_ids)
      end

      def call
        return broadcast(:invalid) if form.invalid?

        transaction do
          add_reports_to_client
          add_report_access_for_client
          # Applies to all existing users
          if form.is_applying_to_existing_users
            add_reports_to_existing_users
            add_report_access_for_existing_users
          end

          ::Clients::Reports::RemoveReport.call!(client,
                                                 removing_report_ids: form.removing_report_ids,
                                                 removing_user_access_report_ids: form.removing_user_access_report_ids,
                                                 is_applying_to_existing_users: form.is_applying_to_existing_users)
        end

        broadcast(:ok)
      rescue Errors::LicenseError => e
        form.errors.add(:adding_report_ids, e.message)
        broadcast(:invalid)
      end

      private

      attr_reader :form, :client, :adding_reports

      # Builds ClientReport and AssessmentClient entities
      #
      def add_reports_to_client
        adding_reports.each do |report|
          # Creates ClientReport
          client_report = client.
                          clients_reports.
                          find_or_initialize_by(report_id: report.id, report_family_id: form.report_family_id)
          client_report.user_access = form.adding_user_access_report_ids.include?(report.id)
          client_report.save!

          # Creates AssessmentClient
          report.assessments.each do |assessment|
            client.assessments_clients.find_or_create_by!(assessment_id: assessment.id)
          end
        end
      end

      # Adds the ability to view reports for users
      #
      def add_report_access_for_client
        return if form.adding_user_access_report_ids.blank?

        client.clients_reports.
          where(report_id: form.adding_user_access_report_ids).
          update_all(user_access: true)
      end

      # Iterates all memberships and assigns reports
      #
      def add_reports_to_existing_users
        return if adding_reports.blank?

        client.memberships.includes(:user).find_each do |membership|
          # From ::Clients::Reports::AssignReportToMembership
          add_reports_to_membership(membership)
        end
      end

      # Adds the ability to view reports for existing users
      #
      def add_report_access_for_existing_users
        return if form.adding_user_access_report_ids.blank?

        AssignsReport.joins(assign: :membership).
          where(assign: { memberships: { client_id: client.id } }).
          where(report_id: form.adding_user_access_report_ids).
          update_all(user_access: true)
      end
    end
  end
end
