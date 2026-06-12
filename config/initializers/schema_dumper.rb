# frozen_string_literal: true

ActiveRecord::Tasks::DatabaseTasks.structure_dump_flags = ['--exclude-schema=lumen']

return unless ActiveRecord::Base.connected?

sql = <<-SQL.squish
  SELECT table_name, table_schema
    FROM INFORMATION_SCHEMA.VIEWS
    where table_name ILIKE 'c_%_datasheet' or table_schema ILIKE 'c_%'
SQL

views = ActiveRecord::Base.connection.execute(sql).map { |c| "#{c['table_schema']}.#{c['table_name']}" }

ActiveRecord::SchemaDumper.ignore_tables += views
