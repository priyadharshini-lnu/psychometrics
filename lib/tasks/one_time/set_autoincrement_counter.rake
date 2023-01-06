# frozen_string_literal: true

namespace :one_time do
  task set_autoincrement_counter: :environment do
    ActiveRecord::Base.connection.tables.each do |table|
      conn = ActiveRecord::Base.connection
      sequence_name = "#{table}_id_seq"
      sequence_exists = conn.execute("SELECT true FROM pg_class where relname = '#{sequence_name}'").first
      next unless sequence_exists

      columns = conn.execute(
        "SELECT column_name as name, udt_name as type FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = '#{table}'"
      )

      columns.each do |column|
        name = column['name']
        type = column['type']
        if (name == 'id' || name.ends_with?('_id')) && %w[int2 int4].include?(type)
          puts "Changed column #{name} of table #{table} to int8"
          ActiveRecord::Migration[5.1].change_column table, name, :int8
        end
      end

      current_seq = conn.execute("SELECT last_value FROM #{sequence_name}").first['last_value']
      new_sequence = ENV['PK_ID_START'].to_i
      if current_seq < new_sequence
        ActiveRecord::Migration[5.1].execute "SELECT setval('#{sequence_name}', #{new_sequence})"
        puts "Sequence changed for #{table}"
      else
        # rubocop:disable Layout/LineLength
        puts "Sequence change skipped for #{table} because current sequence #{current_seq} is more than new_sequence #{new_sequence}"
        # rubocop:enable Layout/LineLength
      end
    end
  end
end
