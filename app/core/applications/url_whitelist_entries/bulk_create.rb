# frozen_string_literal: true

module Applications
  module UrlWhitelistEntries
    class BulkCreate < BaseCommand
      private_attr_reader :application_id, :entries

      def initialize(application_id:, entries:)
        @application_id = application_id
        @entries = entries
      end

      def call
        application = Users::Application.find(application_id)

        created_entries = ActiveRecord::Base.transaction do
          application_setting = application.application_setting || application.create_application_setting!

          entries.map do |entry|
            ApplicationUrlWhitelistEntry.create!(
              application_setting: application_setting,
              url: entry[:url],
              description: entry[:description]
            )
          end
        end

        broadcast :ok, { entries: created_entries }
      rescue StandardError => e
        broadcast :error, [{ title: e.message }]
      end
    end
  end
end
