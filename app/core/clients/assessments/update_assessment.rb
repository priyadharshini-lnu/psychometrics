module Clients
  module Assessments
    class UpdateAssessment < BaseCommand
      def initialize(form, client)
        @form = form
        @client = client
        @removing_dependent_reports = fetch_dependent_reports
      end

      def call
        return broadcast(:invalid) if form.invalid?
        return broadcast(:confirm_remove_dependent_reports, removing_dependent_reports) if removing_dependent_reports.present? &&
                                                                                           !form.is_removing_dependent_reports

        transaction do
          reorder_assessments_clients
          remove_dependent_reports
          remove_assessments_from_existing_users if form.is_applying_to_existing_users
          remove_assessments_clients
        end

        broadcast(:ok)
      end

      private

      attr_reader :form, :client, :removing_dependent_reports

      # Returns a list reports which are dependent on removing assessments
      #
      def fetch_dependent_reports
        keeping_assessment_ids = client.assessment_ids - form.removing_assessment_ids
        keeping_report_ids = Report.
                             joins(:assessments_reports).
                             where(assessments_reports: { assessment_id: keeping_assessment_ids }).
                             ids
        report_ids = Report.
                     joins(:assessments_reports).
                     where(assessments_reports: { assessment_id: form.removing_assessment_ids }).
                     ids

        client.reports.where(id: (report_ids - keeping_report_ids))
      end

      # Sets new Assessment position in particular Client
      #
      def reorder_assessments_clients
        indexed_assessments_clients = client.assessments_clients.index_by(&:id)
        form.assessments_client_ids.each.with_index do |assessments_client_id, position|
          indexed_assessments_clients[assessments_client_id].update_column(:position, position)
        end
      end

      # Removes assigned Assessments from Client
      #
      def remove_assessments_clients
        return if form.removing_assessment_ids.blank?

        client.assessments_clients.
               where(assessment_id: form.removing_assessment_ids).
               destroy_all
      end

      # Removes assign and assigns_report from existing users
      #
      def remove_assessments_from_existing_users
        return if form.removing_assessment_ids.blank?

        Assign.joins(:membership).
               where(memberships: { client_id: client.id }, assessment_id: form.removing_assessment_ids).
               destroy_all
      end

      # Looks for dependent reports and removes them
      #
      def remove_dependent_reports
        return if form.removing_assessment_ids.blank?
        return if removing_dependent_reports.blank?

        ::Clients::Reports::RemoveReport.call!(client, removing_report_ids: removing_dependent_reports.map(&:id),
                                                       is_applying_to_existing_users: form.is_applying_to_existing_users)
      end
    end
  end
end
