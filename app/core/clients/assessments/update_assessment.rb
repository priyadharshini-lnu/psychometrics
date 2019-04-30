module Clients
  module Assessments
    class UpdateAssessment < BaseCommand
      def initialize(form, client)
        @form = form
        @client = client
        @remove_reports = fetch_dependent_reports
      end

      def call
        return broadcast(:invalid) if form.invalid?
        return broadcast(:confirm_remove_dependent_reports, remove_reports) if remove_reports.present? && !form.remove_dependent_reports

        transaction do
          reorder_assessments_clients
          remove_dependent_reports
          remove_assessments_from_existing_users if form.apply_to_existing_users
          remove_assessments_clients
        end

        broadcast(:ok)
      end

      private

      attr_reader :form, :client, :remove_reports

      def fetch_dependent_reports
        keep_assessment_ids = client.assessment_ids - form.remove_assessment_ids
        keep_report_ids = Report.
                          joins(:assessments_reports).
                          where(assessments_reports: { assessment_id: keep_assessment_ids }).
                          ids
        report_ids = Report.
                     joins(:assessments_reports).
                     where(assessments_reports: { assessment_id: form.remove_assessment_ids }).
                     ids

        client.reports.where(id: (report_ids - keep_report_ids))
      end

      # Sets new Assessment position in particular Client
      #
      def reorder_assessments_clients
        form.assessments_client_ids.each.with_index do |assessments_client_id, position|
          assessments_client = client.assessments_clients.find(assessments_client_id)
          assessments_client.update_column(:position, position)
        end
      end

      # Removes assigned Assessments from Client
      #
      def remove_assessments_clients
        return if form.remove_assessment_ids.blank?

        client.assessments_clients.
               where(assessment_id: form.remove_assessment_ids).
               destroy_all
      end

      # Removes assign and assigns_report from existing users
      #
      def remove_assessments_from_existing_users
        return if form.remove_assessment_ids.blank?

        Assign.joins(:membership).
               where(memberships: { client_id: client.id }, assessment_id: form.remove_assessment_ids).
               destroy_all
      end

      # Looks for dependent reports and removes them
      #
      def remove_dependent_reports
        return if form.remove_assessment_ids.blank?
        return if remove_reports.blank?

        ::Clients::Reports::RemoveReport.call!(client, remove_report_ids: remove_reports.map(&:id),
                                                       apply_to_existing_users: form.apply_to_existing_users)
      end
    end
  end
end
