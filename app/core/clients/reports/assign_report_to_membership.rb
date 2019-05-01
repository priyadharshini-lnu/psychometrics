module Clients
  module Reports
    class AssignReportToMembership < BaseCommand
      def initialize(form, client, membership)
        @form = form
        @client = client
        @add_reports = Report.includes(:assessments).where(id: form.report_ids)
        @membership = membership
      end

      def call
        return broadcast(:invalid) if form.invalid?

        transaction do
          add_reports_to_membership(membership)
        end

        broadcast(:ok)
      rescue Errors::LicenseError => e
        form.errors.add(:report_ids, e.message)
        broadcast(:invalid)
      end

      private

      attr_reader :form, :client, :add_reports, :membership

      # Assigns Reports to membership
      #
      def add_reports_to_membership(membership)
        add_reports.each do |report|
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
