# frozen_string_literal: true

module DataMigration
  module Clients
    class Migrate < Rectify::Command
      private_attr_reader :client, :logger

      delegate :log, to: :logger

      def initialize(client_id, out = $stdout)
        @client = Client.find_by(id: client_id)

        @logger = DataMigration::Logger.new('Client', client_id, 0, out)
      end

      def call
        return broadcast(:invalid, 'Client Not Found') if client.nil?
        return broadcast(:rejected, 'Already Migrated') if client.migrated?

        log 'preparing to migrate'
        transaction do
          projects = Client.projects_of(client.id)

          projects.each { |project| migrate(project) }

          log('done.')
          log('updating migration status...')

          client.update_attribute(:migrated, true)
        end

        log('Client migration complete.')
        broadcast(:ok)
      rescue ActiveRecord::RecordInvalid
        broadcast(:error)
      end

      private

      def migrate(project)
        DataMigration::Projects::Migrate.call(project.id, 1, logger.out)
      end
    end
  end
end
