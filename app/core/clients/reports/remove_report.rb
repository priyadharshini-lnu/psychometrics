# frozen_string_literal: true

module Clients
  module Reports
    class RemoveReport < ::BaseCommand
      def initialize(client,
                     removing_report_ids: [],
                     removing_user_access_report_ids: [],
                     is_applying_to_existing_users: false)
        @client = client
        @removing_report_ids = removing_report_ids
        @removing_user_access_report_ids = removing_user_access_report_ids
        @is_applying_to_existing_users = is_applying_to_existing_users
      end

      def call
        transaction do
          remove_reports_from_client
          remove_report_access_for_client
          if is_applying_to_existing_users
            remove_reports_from_existing_users
            remove_report_access_for_existing_users
          end
        end

        broadcast :ok
      end

      private

      attr_reader :removing_report_ids, :removing_user_access_report_ids,
                  :is_applying_to_existing_users, :client

      # Removes already assigned reports from client
      #
      def remove_reports_from_client
        return if removing_report_ids.blank?

        client.clients_reports.
          where(report_id: removing_report_ids).
          delete_all
      end

      # Removes already assigned reports from all existing users
      #
      def remove_reports_from_existing_users
        return if removing_report_ids.blank?

        AssignsReport.joins(assign: :membership).
          where(assign: { memberships: { client_id: client.id } }).
          where(report_id: removing_report_ids).
          delete_all
      end

      # Removes the ability to view report from client settings
      #
      def remove_report_access_for_client
        return if removing_user_access_report_ids.blank?

        client.clients_reports.
          where(report_id: removing_user_access_report_ids).
          update_all(user_access: false)
      end

      # Removes the ability to view reports for existing users
      #
      def remove_report_access_for_existing_users
        return if removing_user_access_report_ids.blank?

        AssignsReport.joins(assign: :membership).
          where(assign: { memberships: { client_id: client.id } }).
          where(report_id: removing_user_access_report_ids).
          update_all(user_access: false)
      end
    end
  end
end
