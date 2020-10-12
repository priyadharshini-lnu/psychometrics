# frozen_string_literal: true

namespace :data_migration do
  desc 'Tasks to migrate old projects of clients to new campaign structure'

  namespace :clients do
    desc 'Tasks handling client data migration'

    task :migrate, [:client_id] => [:environment] do |_, args|
      DataMigration::Clients::Migrate.call(args[:client_id])
    end

    task :undo, [:client_id] => [:environment] do |_, args|
      DataMigration::Clients::Undo.call(args[:client_id])
    end

    task :redo, [:client_id] => %i[undo migrate]
  end
end
