module Clients
  module Reports
    class RemoveReport < ::BaseCommand
      def initialize(client, remove_report_ids: [], remove_user_access_report_ids: [], apply_to_existing_users: false)
        @client = client
        @remove_report_ids = remove_report_ids
        @remove_user_access_report_ids = remove_user_access_report_ids
        @apply_to_existing_users = apply_to_existing_users
      end

      def call
        transaction do
          remove_reports_from_client
          remove_report_access_for_client
          if apply_to_existing_users
            remove_reports_from_existing_users
            remove_report_access_for_existing_users
          end
        end

        broadcast :ok
      end

      private

      attr_reader :remove_report_ids, :remove_user_access_report_ids,
                  :apply_to_existing_users, :client

      # Removes already assigned reports from client
      #
      def remove_reports_from_client
        return if remove_report_ids.blank?

        client.clients_reports.
               where(report_id: remove_report_ids).
               delete_all
      end

      # Removes already assigned reports from all existing users
      #
      def remove_reports_from_existing_users
        return if remove_report_ids.blank?

        AssignsReport.joins(assign: :membership).
                      where(assign: { memberships: { client_id: client.id } }).
                      where(report_id: remove_report_ids).
                      delete_all
      end

      # Removes the ability to view report from client settings
      #
      def remove_report_access_for_client
        return if remove_user_access_report_ids.blank?

        client.clients_reports.
               where(report_id: remove_user_access_report_ids).
               update_all(user_access: false)
      end


      # Removes the ability to view reports for existing users
      #
      def remove_report_access_for_existing_users
        return if remove_user_access_report_ids.blank?

        AssignsReport.joins(assign: :membership).
                      where(assign: { memberships: { client_id: client.id } }).
                      where(report_id: remove_user_access_report_ids).
                      update_all(user_access: false)
      end
    end
  end
end
