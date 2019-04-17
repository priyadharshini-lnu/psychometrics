# frozen_string_literal: true

module Clients
  module AssignReports
    class AssignReport < Rectify::Command
      def initialize(form, client, membership = nil)
        @form = form
        @client = client
        @reports = Report.includes(:assessments).where(id: form.report_ids)
        @remove_reports = Report.includes(:assessments).where(id: form.remove_report_ids)
        @membership = membership
      end

      def call
        return broadcast(:invalid) if form.invalid?

        transaction do
          assign_reports_to_client
          remove_reports_from_client unless form.remove_report_ids.blank?
          # Applies to all existing users
          apply_to_existing_users if form.apply_to_existing_users
          # Applies reports to particular membership
          assign_reports_to_membership(membership) if membership
        end

        broadcast(:ok)
      rescue Errors::LicenseError => e
        form.errors.add(:report_ids, e.message)
        broadcast(:invalid)
      end

      private

      attr_reader :form, :client, :reports, :membership, :remove_reports

      # Builds ClientReport and AssessmentClient entities
      #
      def assign_reports_to_client
        reports.each do |report|
          # Creates ClientReport
          client_report = client.
                          clients_reports.
                          find_or_initialize_by(report_id: report.id, report_family_id: form.report_family_id)
          client_report.user_access = form.user_access_report_ids.include?(report.id)
          client_report.save!

          # Creates AssessmentClient
          report.assessments.each do |assessment|
            client.assessments_clients.find_or_create_by!(assessment_id: assessment.id)
          end
        end
      end

      # Removes already assigned reports from client
      #
      def remove_reports_from_client
        keep_report_ids = client.reports.ids + form.report_ids - form.remove_report_ids
        remove_assessment_ids = Assessment.
                              joins(:assessments_reports).
                              where(assessments_reports: { report_id: form.remove_report_ids }).
                              ids
        keep_assessment_ids = Assessment.
                              joins(:assessments_reports).
                              where(assessments_reports: { report_id: keep_report_ids }).
                              ids
        client.clients_reports.
               where(report_id: form.remove_report_ids, report_family_id: form.report_family_id).
               delete_all
        client.assessments_clients.
               where(assessment_id: (remove_assessment_ids - keep_assessment_ids)).
               delete_all
      end

      # Iterates all memberships and assigns reports
      #
      def apply_to_existing_users
        client.memberships.includes(:user).find_each do |membership|
          assign_reports_to_membership(membership)
        end
      end

      # Assigns selected Reports to membership
      #
      def assign_reports_to_membership(membership)
        reports.each do |report|
          report.assessments.each do |assessment|
            assign = membership.assigns.find_or_create_by!(assessment_id: assessment.id)
            assigns_report = assign.assigns_reports.find_or_initialize_by(report_id: report.id)
            assigns_report.user_access = form.user_access_report_ids.include?(report.id)
            assigns_report.save!
            # Sends to generate PDF report
            ::Reports::ExportJob.perform_later(assigns_report, membership.user) if assign.assign_with_result.completed?
          end
        end
      end
    end
  end
end
