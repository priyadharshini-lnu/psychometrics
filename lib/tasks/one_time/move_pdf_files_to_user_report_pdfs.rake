# frozen_string_literal: true

# Remove param from below rake command if you want to start with last_processed_id from db.
# Or replace it to specific value if you want to pass your owns tarts_with param.
# rake 'one_time:move_pdf_files_to_user_report_pdfs[0]'

namespace :one_time do
  task :move_pdf_files_to_user_report_pdfs, %i[starts_with] => %i[environment] do |_, args|
    user_report_pdfs = []

    time = Benchmark.measure do
      last_processed_id = <<-SQL.squish
        SELECT last_processed_id
        FROM activesupport_tables_migrations
        WHERE model_name = 'UserReport'
      SQL

      db_starts_with = [
        ActiveRecord::Base.connection.execute(last_processed_id)&.first&.dig('last_processed_id'),
        args[:starts_with].to_i,
        0
      ].max

      puts "Start migrating with id##{db_starts_with}."

      UserReport.joins(:pdf_file_attachment).preload(campaign: :campaign_reports).where(
        'user_reports.id >= ?', db_starts_with
      ).order('user_reports.id asc').distinct.in_batches(of: 1000) do |batch|
        campaign_reports = CampaignReport.joins(:campaign).where(
          report_id: batch.map(&:report_id), campaign: { type: ::Campaign::THREESIXTY }
        ).index_by(&:report_id)

        exclude_ids = batch.joins(user_report_pdfs: :pdf_file_attachment).select(:id)

        batch.where.not(id: exclude_ids).each do |user_report|
          user_report_pdf = UserReportPdf.new(
            user_report_id: user_report.id,
            locale: campaign_reports[
              user_report.report_id
            ]&.effective_default_language || user_report.report.default_language
          )

          blob = user_report.pdf_file.blob

          user_report_pdf.pdf_file_attachment = ActiveStorage::Attachment.new(
            record_id: user_report_pdf.id,
            record_type: 'UserReportPdf',
            blob_id: blob.id,
            name: 'pdf_file'
          )

          user_report_pdfs << user_report_pdf
        end

        UserReportPdf.import user_report_pdfs, on_duplicate_key_update: {
          conflict_target: %i[user_report_id locale]
        }, recursive: true

        ActiveRecord::Base.connection.execute(
          <<-SQL.squish
            INSERT INTO activesupport_tables_migrations (table_name, model_name, last_processed_id)
            VALUES ('user_reports', 'UserReport', #{user_report_pdfs.last.user_report_id})
            ON CONFLICT (table_name) DO UPDATE
            SET last_processed_id = #{user_report_pdfs.last.user_report_id}
          SQL
        )
        puts "Migrated up to id##{user_report_pdfs.last.user_report_id}."
        user_report_pdfs = []
      end
    end
    puts "Total time taken: #{time.real} seconds"
  end
end
