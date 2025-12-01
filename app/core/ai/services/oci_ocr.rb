# frozen_string_literal: true

module AI
  module Services
    class OciOcr < BaseCommand
      include ::AI::Providers::Oci::Config

      class DocumentDownloadError < StandardError; end
      class DocumentSizeError < StandardError; end
      class InvalidUrlError < StandardError; end

      private_attr_reader :pdf_url, :language

      LANGUAGE_MAP = {
        'en' => 'ENG',
        'es' => 'SPA',
        'fr' => 'FRA',
        'de' => 'DEU',
        'it' => 'ITA',
        'pt' => 'POR',
        'ru' => 'RUS',
        'ja' => 'JPN',
        'ko' => 'KOR',
        'zh' => 'CHI_SIM',
        'ar' => 'ARA',
        'hi' => 'HIN'
      }.freeze

      def initialize(blob, language: nil)
        @blob = blob
        @pdf_url = blob.url
        @language = language ? LANGUAGE_MAP.fetch(language.to_s.downcase, 'ENG') : nil
      end

      def call
        ocr_response = perform_ocr_object_storage

        extracted_text = extract_text_from_response(ocr_response)
        broadcast(:ok, extracted_text)
      rescue OCI::Errors::ServiceError => e
        Rails.logger.error("OCI OCR Service Error: #{e.message}")
        handle_service_error(e)
      rescue InvalidUrlError, DocumentSizeError => e
        Rails.logger.error("OCI OCR Error: #{e.message}")
        broadcast(:error, e.message)
      end

      private

      def oracle_object_storage_url?(uri)
        # Oracle Object Storage URLs can have multiple formats:
        # 1. Native: https://objectstorage.<region>.oraclecloud.com/n/<namespace>/b/<bucket>/o/<object_name>
        # 2. S3-compatible: https://<namespace>.compat.objectstorage.<region>.oraclecloud.com/<bucket>/<object_name>
        uri.host&.include?('oraclecloud.com') &&
          (uri.host&.include?('objectstorage') || uri.host&.include?('compat.objectstorage'))
      end

      def parse_object_storage_url(url)
        uri = URI.parse(url)
        clean_path = uri.path

        if uri.host&.include?('compat.objectstorage')
          # Oracle storage bucket format: https://<namespace>.compat.objectstorage.<region>.oraclecloud.com/<bucket>/<object_name>
          namespace = uri.host.split('.').first
          path_parts = clean_path.split('/').reject(&:empty?)

          if path_parts.length >= 2
            bucket = CGI.unescape(path_parts[0])
            object_name = path_parts[1..].map { |part| CGI.unescape(part) }.join('/')

            return { namespace: namespace, bucket: bucket, object_name: object_name }
          end
        end

        raise InvalidUrlError, 'Invalid Oracle Object Storage URL format'
      end

      def perform_ocr_object_storage
        Rails.logger.info("Starting OCR processing with PDF URL: #{pdf_url}")

        ai_service_document_client = OCI::AiDocument::AIServiceDocumentClient.new(config: build_oci_config)

        features = [
          OCI::AiDocument::Models::DocumentTextExtractionFeature.new(
            generate_searchable_pdf: false
          )
        ]

        # Add language classification feature if no language is specified
        if language.nil?
          features << OCI::AiDocument::Models::DocumentLanguageClassificationFeature.new
        end

        analyze_document_details = OCI::AiDocument::Models::AnalyzeDocumentDetails.new(
          features: features,
          document: document_details,
          compartment_id: oci_compartment_id
        )

        # Only set language if explicitly provided
        analyze_document_details.language = language if language

        ai_service_document_client.analyze_document(analyze_document_details)
      end

      # The active storage setup will have either oracle object storage url or s3 url
      def document_details
        uri = URI.parse(pdf_url)
        if oracle_object_storage_url?(uri)
          storage_details = parse_object_storage_url(pdf_url)
          OCI::AiDocument::Models::ObjectStorageDocumentDetails.new(
            namespace_name: storage_details[:namespace],
            bucket_name: storage_details[:bucket],
            object_name: storage_details[:object_name]
          )
        else
          document_data = download_and_validate_s3_document
          OCI::AiDocument::Models::InlineDocumentDetails.new(data: document_data)
        end
      end

      def download_and_validate_s3_document
        uri = URI.parse(pdf_url)

        http = Net::HTTP.new(uri.host, uri.port)
        http.use_ssl = true if uri.scheme == 'https'

        request = Net::HTTP::Get.new(uri.request_uri)
        response = http.request(request)

        unless response.is_a?(Net::HTTPSuccess)
          raise DocumentDownloadError, "Failed to download document: #{response.code} #{response.message}"
        end

        document_size = response.body.bytesize
        max_size = 8 * 1024 * 1024 # 8MB in bytes

        if document_size > max_size
          raise DocumentSizeError,
                "Document size (#{document_size} bytes) exceeds maximum allowed size of #{max_size} bytes (8MB)"
        end

        Rails.logger.info("Downloaded S3 document: #{document_size} bytes")
        Base64.strict_encode64(response.body)
      end

      def extract_text_from_response(response)
        return '' unless response&.data&.pages

        # Log detected languages if language classification was performed
        handle_detected_languages(response.data.detected_languages)

        extracted_text = []

        response.data.pages.each do |page|
          page_text = []

          if page.lines&.any?
            page.lines.each do |line|
              page_text << line.text if line.text.present?
            end
          end

          extracted_text << page_text.join("\n") if page_text.any?
        end

        result_text = extracted_text.join("\n\n")
        Rails.logger.info("OCR processing completed. Extracted #{result_text.length} characters")

        result_text
      end

      def handle_service_error(error)
        case error.status_code
          when 413
            broadcast(:error, "OCI service error: #{error.message}")
          else
            raise error
        end
      end

      # We don't have use for this response, but logging detected languages for debugging
      def handle_detected_languages(detected_languages)
        return if detected_languages.blank?

        detected_langs = detected_languages.map { |lang| "#{lang.language} (#{lang.confidence})" }
        Rails.logger.info("AI::Services::OciOcr Detected languages: #{detected_langs.join(', ')}")
      end
    end
  end
end
