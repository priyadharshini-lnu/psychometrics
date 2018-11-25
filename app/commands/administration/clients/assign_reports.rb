# frozen_string_literal: true

module Administration
  module Clients
    class AssignReports < Rectify::Command
      def initialize(form, client)
        @form = form
        @client = client
        @reports = Report.includes(:assessments).where(id: form.report_ids)
      end

      def call
        return broadcast(:invalid) if form.invalid?

        transaction do
          assign_reports
          apply_to_existing_users if form.apply_to_existing_users
        end

        broadcast(:ok)
      end

      private

      attr_reader :form, :client, :reports

      # Builds ClientReport and AssessmentClient entities
      def assign_reports
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

      def apply_to_existing_users
        client.memberships.find_each do |membership|
          reports.find_each do |report|
            report.assessments.each do |assessment|
              assign = membership.assigns.find_or_create_by!(assessment_id: assessment.id)
              assign_report = assign.assigns_reports.find_or_initialize_by(report_id: report.id)
              assign_report.user_access = form.user_access_report_ids.include?(report.id)
              assign_report.save!
            end
          end
        end
      end
    end
  end
end
