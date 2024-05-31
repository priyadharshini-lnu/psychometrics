# frozen_string_literal: true

module AdminJobs
  class BaseExportCsv < AdminJobs::Base
    include ActionView::Helpers::TagHelper
    include ActionView::Context

    def call
      write_csv
      record.update!(file: File.open(file_path))
      job_record.complete!
      FileUtils.rm_f(file_path)

      broadcast :ok
    end

    def write_csv
      job_record.update(total_tasks: record_count)
      CSV.open(file_path, 'wb') do |csv|
        write_csv_headers(csv)
        records_for_export.each_with_index do |record, index|
          rows = data_row(record).first.is_a?(Array) ? data_row(record) : [data_row(record)]
          rows.each do |row|
            csv << row
          end

          record_count = index + 1
          if (record_count % flush_threshold).zero?
            csv.flush
            job_record.update!(completed_tasks: record_count)
          end
        end
      end
    end

    def write_csv_headers(csv)
      if respond_to?(:headers, true)
        if headers[0].is_a?(Array)
          headers.each { |header| csv << header }
        else
          csv << headers
        end
      end
    end

    def records_for_export
      raise NoMethodError, 'Define records_for_export in subclass'
    end

    def data_row(_row)
      raise NoMethodError, 'Define data_row in subclass'
    end

    def flush_threshold
      (record_count / 100).to_i.clamp(100, 1000)
    end

    def record_count
      @record_count ||= records_for_export.count
    end

    def export_name
      self.class.name.snakecase
    end

    def file_link
      content_tag(:a, record.file.real_filename, href: record.file.url) if record.file.present?
    end

    def file_name
      raise NoMethodError, 'Define file_name in subclass'
    end

    def file_path
      return @file_path if defined?(@file_path)

      directory = Rails.root.join('tmp', export_name, record.id.to_s)
      FileUtils.mkdir_p(directory)
      @file_path ||= directory.join(file_name)
    end

    def campaign_ids
      return record.data['campaign_ids'] if record.data['campaign_ids'].present?

      if record.data['project_ids'].present?
        @campaign_ids ||= Campaign.where(project_id: record.data['project_ids']).pluck(:id)
      end
    end
  end
end
