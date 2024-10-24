# frozen_string_literal: true

require 'tty-progressbar'

namespace :data_migration do
  desc 'Migrate datasheet data from json to separate sheet_row_data table'
  task :migrate_datasheet_data, %i[row_id] => %i[environment] do |_task, args|
    id = args[:row_id] || 1
    puts "Start from #{id}"
    query = SheetRow.where(migrated: false).order(:id).where('id >= ?', id)
    bar = TTY::ProgressBar.new('Migrating [:bar] :current/:total :eta', total: query.count)

    query.find_each do |row|
      ApplicationRecord.transaction do
        row.sync_data
      end
      puts "Migration done for row with id #{row.id}"
      bar.advance(1)
    end
  end
end
