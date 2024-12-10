# frozen_string_literal: true

require 'tty-progressbar'

namespace :data_migration do
  desc 'Migrate custom profile fields separate profile_field_values table'
  task :profile_fields, %i[id] => %i[environment] do |_task, args|
    id = args[:id] || 1
    puts "Start from #{id}"
    query = UserProfile.order(:id).where('id >= ?', id)
    bar = TTY::ProgressBar.new('Migrating [:bar] :current/:total :eta', total: query.count)

    query.find_each do |row|
      ApplicationRecord.transaction do
        row.sync_data
      end
      bar.advance(1)
    end
  end
end
