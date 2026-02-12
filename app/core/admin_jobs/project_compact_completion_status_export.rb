# frozen_string_literal: true

require 'csv-safe'

module AdminJobs
  class ProjectCompactCompletionStatusExport < BaseExportCsv
    USER_COLUMN_COUNT = 3 # email, first_name, last_name

    def generate_details
      [[I18n.t('common.model.completion_statuses'), file_link]]
    end

    private

    def headers
      base_headers = base_record_headers
      insert_campaign_headers(base_headers)
    end

    def campaign_headers
      %w[campaign_id campaign_name]
    end

    def base_record_headers
      first_record = records_for_export(1, 0).first
      record_keys = first_record&.dig(:record)&.keys

      record_keys || Campaigns::CompactCompletionStatusQuery::DEFAULT_COLUMN_NAMES
    end

    def insert_campaign_headers(base_headers)
      user_columns = base_headers.take(USER_COLUMN_COUNT)
      remaining_columns = base_headers.drop(USER_COLUMN_COUNT)

      user_columns + campaign_headers + remaining_columns
    end

    def write_csv
      job_record.update(total_tasks: record_count)

      CSVSafe.open(file_path, 'wb') do |csv|
        write_csv_headers(csv)

        limit = 1000
        offset = 0

        loop do
          records = records_for_export(limit, offset)
          break if records.empty?

          records.each do |record_data|
            rows = build_data_rows(record_data)
            rows.each { |row| csv << row }
          end

          offset += limit
          update_job_progress(csv, offset)
        end

        job_record.complete!
      end
    end

    def build_data_rows(record_data)
      campaign_id = record_data[:campaign_id]
      campaign_name = record_data[:campaign_name]
      record_values = record_data[:record].values

      base_rows = record_values.first.is_a?(Array) ? record_values : [record_values]
      base_rows.map { |row| insert_campaign_data(row, campaign_id, campaign_name) }
    end

    def insert_campaign_data(row, campaign_id, campaign_name)
      user_data = row.take(USER_COLUMN_COUNT)
      remaining_data = row.drop(USER_COLUMN_COUNT)

      user_data + [campaign_id, campaign_name] + remaining_data
    end

    def update_job_progress(csv, completed_record_count)
      return unless (completed_record_count % flush_threshold).zero?

      csv.flush
      job_record.update!(completed_tasks: completed_record_count)
    end

    def records_for_export(limit = 1000, offset = 0)
      campaigns = project_campaigns
      results = []

      campaigns.find_each do |campaign|
        campaign_records = fetch_campaign_records(campaign, limit, offset)

        campaign_records.each do |record|
          results << build_record_data(campaign, record)
        end
      end

      results
    end

    def fetch_campaign_records(campaign, limit, offset)
      Campaigns::CompactCompletionStatusQuery.new(
        campaign.id,
        limit: limit,
        offset: offset,
        include_inactive_users: include_inactive_users
      ).query.to_a
    end

    def build_record_data(campaign, record)
      {
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        record: record
      }
    end

    def record_count
      project_campaigns.sum do |campaign|
        Campaigns::CompactCompletionStatusQuery.new(
          campaign.id,
          include_inactive_users: include_inactive_users
        ).query.count
      end
    end

    def project_campaigns
      Campaign.where(project_id: record.data['project_id'])
    end

    def include_inactive_users
      record.data['include_inactive_users'] || false
    end

    def file_name
      'project-compact-completion-statuses.csv'
    end
  end
end
