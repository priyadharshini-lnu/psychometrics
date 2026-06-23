# frozen_string_literal: true

module SystemCheckRecords
  class ProcessMediaUpload < BaseCommand
    private_attr_reader :system_check_record, :asset_key, :upload_id, :parts, :file_size, :content_type, :checksum,
                        :test_phrase, :locale, :transcribed_text, :face_detected, :face_detection_ratio

    def initialize(system_check_record, options = {})
      @system_check_record = system_check_record
      @asset_key = options[:asset_key]
      @upload_id = options[:upload_id]
      @parts = options[:parts]
      @content_type = options[:content_type]
      @checksum = options[:checksum]
      @file_size = options[:file_size]
      @test_phrase = options[:test_phrase]
      @locale = options[:locale]
      @transcribed_text = options[:transcribed_text]
      @face_detection_ratio = options[:face_detection_ratio]
    end

    def call
      complete_s3_upload
      blob = create_storage_blob
      attach_media_to_record(blob)
      update_passed_status
      process_phrase_or_update_record

      system_check_record.reload
      broadcast(:ok, system_check_record)
    rescue StandardError => e
      record_upload_error(e)
      broadcast(:error, e.message)
    end

    private

    def complete_s3_upload
      Aws::S3::Client.new.complete_multipart_upload({
        bucket: Settings.secrets.s3_compatible_storage[:private_bucket],
        key: asset_key,
        multipart_upload: {
          parts: parts.map { |part| part.permit!.to_h }
        },
        upload_id: upload_id
      })
    end

    def create_storage_blob
      file_name = asset_key.split('/').last

      ActiveStorage::Blob.create_before_direct_upload!(
        key: asset_key,
        filename: file_name,
        byte_size: file_size,
        checksum: checksum,
        content_type: content_type,
        service_name: Settings.storage.private_storage_service
      )
    end

    def attach_media_to_record(blob)
      ActiveStorage::Attachment.create!(
        name: 'media',
        record: system_check_record,
        blob: blob
      )
    end

    def prepare_record_data
      record_data = (system_check_record.data || {}).except('upload_error')
      if face_detection_ratio.present?
        record_data = record_data.merge('face_detection_ratio' => face_detection_ratio)
      end
      record_data
    end

    def process_phrase_or_update_record
      record_data = prepare_record_data

      if test_phrase.present?
        system_check_record.data = record_data.merge('test_phrase' => test_phrase, 'locale' => locale)
        system_check_record.save!

        SystemCheckRecords::VerifyPhrase.call(
          system_check_record: system_check_record,
          transcribed_text: transcribed_text.to_s
        )
      else
        system_check_record.update!(data: record_data)
      end
    end

    def update_passed_status
      # Default to passed unless specific requirements aren't met
      system_check_record.update!(passed: true)
    end

    def record_upload_error(error)
      update_record_data('upload_error' => error.message)
    end

    def update_record_data(data)
      system_check_record.data = (system_check_record.data || {}).merge(data)
      system_check_record.save!
    end
  end
end
