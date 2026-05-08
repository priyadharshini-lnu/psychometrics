# frozen_string_literal: true

require 'uri'

# Rake task to migrate root-level tracked variant blob keys to the canonical variants path.
#
# Root-level variant blobs are created when a variant is processed before the variant key
# patch is applied — Active Storage generates a random secure token as the blob key,
# placing the object at the root of the S3 bucket.
#
# The canonical variant key format is:
#   <parent_blob_directory>/variants/<sha256(variation_key)>
#
# For example, if the original blob key is:
#   public/library/42/file/abc123_photo.png
# The canonical variant key becomes:
#   public/library/42/file/variants/<sha256>
#
# Run examples:
#   rake data_migration:migrate_root_variant_objects
#   rake data_migration:migrate_root_variant_objects[500, true, my-bucket-name]
#   - batch_size:   (optional) number of records per batch (default: 1000)
#   - dry_run:      (optional) true to simulate without changes (default: false)
#   - bucket_name:  (optional) S3 bucket override (default: inferred from variant blob service)

namespace :data_migration do
  desc 'Migrate root-level ActiveStorage tracked variant objects to <parent_dir>/variants/<sha256(variation_key)>'
  task :migrate_root_variant_objects,
       %i[batch_size dry_run bucket_name] => %i[environment] do |_, args|
    batch_size = args[:batch_size].to_i
    batch_size = 1000 if batch_size <= 0
    dry_run = ActiveModel::Type::Boolean.new.cast(args[:dry_run])
    bucket_name = args[:bucket_name].presence

    s3_client = Aws::S3::Client.new

    counters = {
      variant_images_checked: 0,
      skipped_non_root_variant_blob_key: 0,
      skipped_unknown_variation: 0,
      variants_migrated: 0,
      variants_already_migrated: 0,
      copy_errors: 0,
      db_update_errors: 0,
      source_delete_errors: 0
    }
    puts "Starting root-level variant migration, batch_size=#{batch_size}, dry_run=#{dry_run}"

    ActiveStorage::Attachment.
      where(record_type: 'ActiveStorage::VariantRecord').
      includes(:blob, record: :blob).
      find_in_batches(batch_size: batch_size) do |attachment_batch|
      attachment_batch.each do |attachment|
        variant_blob = attachment.blob
        variant_record = attachment.record
        original_blob = variant_record.blob
        next unless variant_record.is_a?(ActiveStorage::VariantRecord)

        counters[:variant_images_checked] += 1

        unless root_object_key?(variant_blob.key)
          counters[:skipped_non_root_variant_blob_key] += 1
          next
        end

        next unless original_blob

        parent_dir = File.dirname(original_blob.key)
        target_variant_key = "#{parent_dir}/variants/#{variant_record.variation_digest}"
        bucket = bucket_name_for_blob(variant_blob, bucket_name)
        source_variant_key = variant_blob.key

        if s3_object_exists?(s3_client, bucket, target_variant_key)
          if dry_run
            counters[:variants_already_migrated] += 1
            puts "[DRY RUN] Re-link variant_blob_id=#{variant_blob.id}: #{source_variant_key} -> #{target_variant_key}"
            next
          end

          begin
            variant_blob.update_columns(key: target_variant_key)
            puts "Re-linked variant_blob_id=#{variant_blob.id}: #{source_variant_key} -> #{target_variant_key}"
          rescue StandardError => e
            counters[:db_update_errors] += 1
            puts "Failed DB re-link for variant_blob_id=#{variant_blob.id}, " \
                 "source=#{source_variant_key}, target=#{target_variant_key}: #{e.message}"
            next
          end

          begin
            s3_client.delete_object(bucket: bucket, key: source_variant_key) if s3_object_exists?(s3_client, bucket,
                                                                                                  source_variant_key)
          rescue Aws::S3::Errors::ServiceError => e
            counters[:source_delete_errors] += 1
            puts "Source cleanup failed for variant_blob_id=#{variant_blob.id}, " \
                 "source=#{source_variant_key}: #{e.message}"
          end

          counters[:variants_already_migrated] += 1
          next
        end

        if dry_run
          counters[:variants_migrated] += 1
          puts "[DRY RUN] #{source_variant_key} -> #{target_variant_key}"
          next
        end

        begin
          s3_client.copy_object(
            bucket: bucket,
            copy_source: copy_source(bucket, source_variant_key),
            key: target_variant_key
          )

          begin
            variant_blob.update_columns(key: target_variant_key)
          rescue StandardError => e
            counters[:db_update_errors] += 1
            puts "Failed DB update for variant_blob_id=#{variant_blob.id}, " \
                 "source=#{source_variant_key}, target=#{target_variant_key}: #{e.message}"
            next
          end

          begin
            s3_client.delete_object(bucket: bucket, key: source_variant_key)
          rescue Aws::S3::Errors::ServiceError => e
            counters[:source_delete_errors] += 1
            puts "Source cleanup failed for variant_blob_id=#{variant_blob.id}, " \
                 "source=#{source_variant_key}: #{e.message}"
          end

          counters[:variants_migrated] += 1
          puts "Migrated variant_blob_id=#{variant_blob.id}: #{source_variant_key} -> #{target_variant_key}"
        rescue Aws::S3::Errors::ServiceError => e
          counters[:copy_errors] += 1
          puts "Failed for variant_blob_id=#{variant_blob.id}, " \
               "source=#{source_variant_key}, target=#{target_variant_key}: #{e.message}"
        end
      end

      puts "Processed up to variant_record_attachment_id=#{attachment_batch.last.id}"
    end

    puts 'Migration completed with summary:'
    counters.each { |key, value| puts "  #{key}: #{value}" }
  end
end

def s3_object_exists?(s3_client, bucket_name, key)
  return false if key.blank?

  s3_client.head_object(bucket: bucket_name, key: key)
  true
rescue Aws::S3::Errors::BadRequest => e
  normalized_key = key.to_s.sub(%r{\A/+}, '')
  return false if normalized_key == key

  begin
    s3_client.head_object(bucket: bucket_name, key: normalized_key)
    true
  rescue Aws::S3::Errors::ServiceError
    puts "Skipping key due to S3 bad request: #{key} (#{e.class})"
    false
  end
rescue Aws::S3::Errors::NotFound, Aws::S3::Errors::NoSuchKey
  false
end

def copy_source(bucket_name, source_key)
  "#{bucket_name}/#{URI.encode_uri_component(source_key.to_s)}"
end

def root_object_key?(key)
  key.present? && key.exclude?('/')
end

def bucket_name_for_blob(blob, bucket_name_override)
  return bucket_name_override if bucket_name_override.present?

  service = blob.service
  inferred_bucket_name =
    if service.respond_to?(:bucket) && service.bucket.respond_to?(:name)
      service.bucket.name
    elsif blob.service_name == Settings.storage.private_storage_service
      Settings.secrets.s3_compatible_storage[:private_bucket]
    elsif blob.service_name == Settings.storage.public_storage_service
      Settings.secrets.s3_compatible_storage[:public_bucket]
    end

  return inferred_bucket_name if inferred_bucket_name.present?

  raise ArgumentError, "Unable to infer S3 bucket for blob #{blob.id} (service_name: #{blob.service_name.inspect}). " \
                       'Provide bucket_name explicitly when running migrate_root_variant_objects.'
end
