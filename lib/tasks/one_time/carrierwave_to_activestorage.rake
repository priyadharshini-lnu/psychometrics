# frozen_string_literal: true

namespace :carrierwave do
  desc 'Migrate attachments to ActiveStorage'

  task migrate_to_activestorage: :environment do
    tables_to_migrate_attributes = {
      'assessments' => Assessment,
      'dashboards' => Dashboard,
      'design_settings' => DesignSetting,
      'factors' => Factor,
      'innovation_styles' => InnovationStyle,
      'libraries' => Library,
      'media_responses' => MediaResponse,
      'occupations' => Occupation,
      'reports' => Report,
      'user_profiles' => UserProfile,
      'user_reports' => UserReport,
      'admin_jobs' => AdminJobRecord
    }

    puts 'Starting CarrierWave to ActiveStorage attachments migration.'
    tables_to_migrate_attributes.each_pair do |table, model|
      last_processed_id = <<-SQL.squish
        SELECT last_processed_id
        FROM activesupport_tables_migrations
        WHERE model_name = '#{model.name}'
      SQL

      start_with = ActiveRecord::Base.connection.execute(last_processed_id)&.first&.dig('last_processed_id') || 0

      puts "Start migrating #{table} with id##{start_with}."

      model.where('id >= ?', start_with).order('id DESC').find_each do |record|
        syncable_attributes = model.sync_to_active_storage
        next if syncable_attributes.empty?

        syncable_attributes.each do |attribute|
          attribute = attribute.to_s

          # workaround for UserReport, as in future when migrated to ActiveStorage it will conflict
          # with :pdf attribute for UserReport model
          as_attribute = attribute == 'pdf' ? 'pdf_file' : attribute

          begin
            next if record.send(attribute).blank? || record.send("as_#{as_attribute}").attached?

            unless record.send(attribute).file.exists?
              Rails.logger.info("Missing :#{attribute} file for #{record.class}##{record.id}")
              next
            end

            ActiveStorageSyncJob.new.sync_activestorage(record, attribute)

            ActiveRecord::Base.connection.execute(
              <<-SQL.squish
                INSERT
                INTO activesupport_tables_migrations (table_name, model_name, last_processed_id)
                VALUES ('#{table}', '#{model.name}', #{record.id})
                ON CONFLICT (table_name) DO UPDATE
                SET last_processed_id = #{record.id}
              SQL
            )
          rescue Excon::Error::Forbidden
            Rails.logger.info("Access forbidden for #{record.class}##{record.id} #{attribute} attribute")
            next
          end
        end
      end

      puts "Completed migrating #{table}."
    end

    puts '************************'
    puts 'Attachments migration from CarrierWave to ActiveStorage completed.'
    puts 'You can now remove CarrierWave integrations from model and use ActiveStorage'
    puts '************************'
  end
end

namespace :activestorage do
  desc 'Rename ActiveStorage attributes'

  task rename_attributes: :environment do
    sql = <<-SQL.squish
      UPDATE active_storage_attachments
      SET name = regexp_replace(name, '^as_', '')
    SQL

    ActiveRecord::Base.connection.execute(sql)
  end
end
