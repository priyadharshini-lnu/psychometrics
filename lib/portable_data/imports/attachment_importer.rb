# frozen_string_literal: true

module PortableData
  module Imports
    class AttachmentImporter
      ALLOWED_CONTENT_TYPES = %w[
        application/pdf
        application/msword
        application/vnd.openxmlformats-officedocument.wordprocessingml.document
        application/vnd.ms-excel
        application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
        image/jpeg
        image/png
        image/gif
        application/octet-stream
      ].freeze

      def initialize(record, field_name, attachment_data, index)
        @record = record
        @field_name = field_name
        @attachment_data = attachment_data
        @index = index
      end

      def import
        return unless @attachment_data && @attachment_data[:url]

        existing_attachment = @record.send(@field_name)
        if existing_attachment&.blob&.id != @attachment_data[:blob_id]
          attach_new_file
        end
      rescue StandardError => e
        log_error(e)
        raise AttachmentImportError, "Failed to import #{@field_name}: #{e.message}"
      end

      private

      def attach_new_file
        downloaded_file = download_file(@attachment_data[:url])
        @record.send(@field_name).attach(
          io: downloaded_file,
          filename: @attachment_data[:filename] || File.basename(@attachment_data[:url]),
          content_type: determine_content_type(@attachment_data[:url])
        )
      end

      def download_file(url)
        response = fetch(url)

        downloaded_file = StringIO.new(response.body)
        downloaded_file.class.class_eval { attr_accessor :original_filename, :content_type }
        downloaded_file.original_filename = File.basename(url)
        downloaded_file.content_type = 'application/octet-stream'
        downloaded_file
      end

      def fetch(url)
        response = Faraday.get(url)

        unless response.success?
          raise AttachmentImportError, "HTTP Error: #{response.status} - #{response.reason_phrase}"
        end

        response
      rescue Faraday::Error => e
        raise AttachmentImportError, "HTTP Error: #{e.message}"
      end

      def determine_content_type(url)
        extension = File.extname(url).delete('.')
        mime_type = MIME::Types.type_for(extension).first
        content_type = mime_type&.content_type || 'application/octet-stream'

        return content_type if ALLOWED_CONTENT_TYPES.include?(content_type)

        'application/octet-stream'
      end

      def log_error(error)
        Rails.logger.error(
          "Failed to import attachment for #{@record.class.name}.#{@field_name} " \
          "with id #{@record.id} at index #{@index}: #{error.message}"
        )
      end

      class AttachmentImportError < StandardError; end
    end
  end
end
