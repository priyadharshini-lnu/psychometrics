# frozen_string_literal: true

namespace :data_migration do
  desc 'Tasks to migrate old projects to new campaign structure'

  namespace :projects do
    desc 'Tasks handling projects data migration'

    task :migrate, [:project_id] => [:environment] do |_, args|
      DataMigration::Projects::Migrate.call(args[:project_id])
    end

    task :undo, [:project_id] => [:environment] do |_, args|
      DataMigration::Projects::Undo.call(args[:project_id])
    end

    task :redo, [:project_id] => %i[undo migrate]
  end
end
