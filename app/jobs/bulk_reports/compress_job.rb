# frozen_string_literal: true

module BulkReports
  class CompressJob < ApplicationJob
    queue_as :default

    def perform(report)
      # Start with cleaning up
      FileUtils.rm_rf(report.output_dir) if File.exist?(report.output_dir)

      # Create a fresh directory for output
      FileUtils.mkdir_p(report.output_dir)

      options = [
        report.input_dir,
        report.output_dir,
        size_limit: Settings.bulk_reports.size_limit, base_file_name: 'bulk-report'
      ]
      Sidekiq.logger.info("Compressor.new(#{options})")
      Compressor.new(*options).process

      add_files_to_bulk_report(report)
      # Delete the output_dir created here
      clean(report)
    end

    private

    def clean(report)
      FileUtils.rm_rf(report.output_dir) if File.exist?(report.output_dir)
    end

    def add_files_to_bulk_report(report)
      files = Dir.children(report.output_dir).map do |filename|
        Pathname.new(File.join(report.output_dir, filename)).open
      end

      report.files = files
      report.save!
    end
  end
end
