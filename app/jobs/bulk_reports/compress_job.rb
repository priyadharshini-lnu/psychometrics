# frozen_string_literal: true

module BulkReports
  class CompressJob < ApplicationJob
    queue_as :default

    def perform(report)
      Dir.mktmpdir do |dir|
        input_dir = report.input_dir
        output_file = File.join(dir, report.output_file)

        Sidekiq.logger.info("ZipFileGenerator.new(#{input_dir}, #{output_file})")
        ZipFileGenerator.new(input_dir, output_file).write

        save_report_with_file(report, output_file)
      end
    end

    private

    def save_report_with_file(report, file)
      File.open(file) do |f|
        report.file = f
        report.save!
      end
    end
  end
end
