# frozen_string_literal: true

module DataMigration
  module Clients
    class Undo < Rectify::Command
      private_attr_reader :client, :logger

      delegate :log, to: :logger

      def initialize(client_id, out = $stdout)
        @client = Client.find_by(id: client_id)
        @logger = DataMigration::Logger.new('Client', client_id, 0, out)
      end

      def call
        return broadcast(:invalid) if client.nil?
        return broadcast(:invalid) unless client.migrated?

        log('preparing to undo client migration')
        transaction do
          projects = Client.projects_of(client.id)

          projects.each { |project| DataMigration::Projects::Undo.call(project.id, 1, logger.out) }

          log('done.')
          log('updating migration status')

          client.update_attribute(:migrated, false)
        end

        broadcast(:ok)
      rescue ActiveRecord::RecordInvalid
        broadcast(:error)
      end
    end
  end
end
