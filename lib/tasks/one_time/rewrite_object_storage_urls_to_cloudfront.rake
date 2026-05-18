# frozen_string_literal: true

namespace :one_time do
  desc 'Rewrite persisted public object storage URLs to unsigned CloudFront URLs'
  task :rewrite_object_storage_urls_to_cloudfront, %i[dry_run batch_size old_url new_url] => [:environment] do |_, args|
    dry_run = ActiveModel::Type::Boolean.new.cast(args[:dry_run])

    puts 'Starting object storage URL rewrite to CloudFront'
    puts "  dry_run: #{dry_run}"
    puts

    if args[:old_url].blank? || args[:new_url].blank?
      puts 'ERROR: old_url and new_url are required.'
      puts 'Usage: rake one_time:rewrite_object_storage_urls_to_cloudfront[dry_run,batch_size,old_url,new_url]'
      abort
    end

    normalize_prefix = lambda do |value|
      trimmed = value.to_s.strip
      trimmed.end_with?('/') ? trimmed : "#{trimmed}/"
    end

    old_public_prefix = normalize_prefix.call(args[:old_url])
    new_public_prefix = normalize_prefix.call(args[:new_url])

    puts "  old_url: #{old_public_prefix}"
    puts "  new_url: #{new_public_prefix}"
    puts

    # Each entry: [table, column, cast_type]
    # cast_type is used to cast the replaced text back to the appropriate Postgres type.
    columns = [
      %w[questions props json],
      %w[blocks props json],
      %w[reports_pages props json],
      %w[reports_pages display_logic jsonb],
      %w[reports_modules props json],
      %w[reports_modules meta json],
      %w[translations props json],
      %w[translations data jsonb]
    ]

    conn = ActiveRecord::Base.connection
    counters = {}

    columns.each do |table, column, cast_type|
      key = "#{table}.#{column}"
      like_pattern = "%#{old_public_prefix}%"

      if dry_run
        sql = ActiveRecord::Base.sanitize_sql_array(
          ["SELECT COUNT(*) FROM #{table} WHERE #{column}::text LIKE ?", like_pattern]
        )
        result = conn.execute(sql)
        counters[key] = result.first['count'].to_i
      else
        sql = ActiveRecord::Base.sanitize_sql_array(
          [
            "UPDATE #{table} SET #{column} = REPLACE(#{column}::text, ?, ?)::#{cast_type} WHERE #{column}::text LIKE ?",
            old_public_prefix, new_public_prefix, like_pattern
          ]
        )
        result = conn.execute(sql)
        counters[key] = result.cmd_tuples
      end

      puts "  #{key}: #{counters[key]} rows #{dry_run ? 'would be updated' : 'updated'}"
    end

    puts "\nCloudFront Rewrite Summary:"
    counters.each do |key, count|
      puts "  #{key}: #{count} rows #{dry_run ? 'would be updated' : 'updated'}"
    end

    if dry_run
      puts "\n[DRY RUN MODE] - No changes applied. Re-run with dry_run=false to execute."
    end
  end

  desc 'Change ActiveStorage::Blob service_name from old_service_name to new_service_name'
  task :change_active_storage_blob_service_name,
       %i[old_service_name new_service_name dry_run batch_size] => [:environment] do |_, args|
    old_service_name = args[:old_service_name].to_s.strip
    new_service_name = args[:new_service_name].to_s.strip
    dry_run = ActiveModel::Type::Boolean.new.cast(args[:dry_run])
    batch_size = args[:batch_size].to_i
    batch_size = 1000 if batch_size <= 0

    if old_service_name.blank? || new_service_name.blank?
      puts 'ERROR: old_service_name and new_service_name are required.'
      puts 'Usage: rake one_time:change_active_storage_blob_service_name[old_service_name,new_service_name,dry_run,
        batch_size]'
      abort
    end

    if old_service_name == new_service_name
      puts 'ERROR: old_service_name and new_service_name must be different.'
      abort
    end

    puts 'Starting ActiveStorage::Blob service_name migration'

    relation = ActiveStorage::Blob.where(service_name: old_service_name)
    total_matches = relation.count
    puts "  matched_blobs: #{total_matches}"

    if dry_run
      puts "\n[DRY RUN MODE] - No changes applied. Re-run with dry_run=false to execute."
      next
    end

    updated_count = 0
    relation.in_batches(of: batch_size) do |batch|
      updated_count += batch.update_all(service_name: new_service_name)
    end

    puts "  updated_blobs: #{updated_count}"
    puts "\nActiveStorage::Blob service_name migration completed."
  end
end
