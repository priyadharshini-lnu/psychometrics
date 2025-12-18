# frozen_string_literal: true

module Yoodli
  class ImportFromS3Service
    private_attr_accessor :date, :campaign_id, :user_assessment_id

    def self.call(date: nil, campaign_id: nil, user_assessment_id: nil)
      new(date: date, campaign_id: campaign_id, user_assessment_id: user_assessment_id).call
    end

    def initialize(date: nil, campaign_id: nil, user_assessment_id: nil)
      @date = date || Time.current.utc.strftime('%Y-%m-%d')
      @campaign_id = campaign_id
      @user_assessment_id = user_assessment_id
    end

    def call
      total_processed_emails = Set.new
      total_errors = []

      csv_files = fetch_csv_files
      return empty_result if csv_files.empty?

      csv_files.each do |csv_file|
        process_csv_file(csv_file, total_processed_emails, total_errors)
      end

      build_result(total_processed_emails, total_errors, csv_files.size)
    rescue StandardError => e
      { success: false, processed_users: 0, files_processed: 0, errors: [e.message] }
    end

    private

    def fetch_csv_files
      s3_client = Aws::S3::Client.new
      bucket_name = Settings.secrets.s3_compatible_storage[:yoodli_reports_bucket]
      response = s3_client.list_objects_v2(bucket: bucket_name)

      response.contents.select do |object|
        object.key.downcase.end_with?('.csv') &&
          object.key.include?(date) &&
          object.size.positive?
      end
    end

    def process_csv_file(csv_file, total_processed_emails, total_errors)
      s3_client = Aws::S3::Client.new
      bucket_name = Settings.secrets.s3_compatible_storage[:yoodli_reports_bucket]

      csv_content = s3_client.get_object(
        bucket: bucket_name,
        key: csv_file.key
      ).body.read

      result = ImportExternalResults.call(csv_content: csv_content, campaign: campaign,
                                          user_assessment_id: user_assessment_id)

      if result[:success]
        result[:processed_user_emails].each { |email| total_processed_emails.add(email) }
      else
        total_errors.concat(result[:errors])
      end
    rescue StandardError => e
      total_errors << "#{csv_file.key}: #{e.message}"
    end

    def empty_result
      { success: true, processed_users: 0, files_processed: 0, errors: [] }
    end

    def build_result(total_processed_emails, total_errors, files_count)
      {
        success: total_errors.empty?,
        processed_users: total_processed_emails.size,
        files_processed: files_count,
        errors: total_errors
      }
    end

    def campaign
      @campaign ||= Campaign.find_by(id: campaign_id) if campaign_id
    end
  end
end
