# frozen_string_literal: true

require 'tty-progressbar'

namespace :data_migration do
  desc 'Give every report without a published snapshot its first one'
  task :backfill_report_published_snapshots, %i[dry_run] => %i[environment] do |_task, args|
    dry_run = ActiveModel::Type::Boolean.new.cast(args[:dry_run])

    reports = Report.not_deleted.where.missing(:published_snapshot).order(:id)
    total = reports.count

    if dry_run
      # We are using already existing `deleted_at` columns in reports_pages and reports_modules table
      # This was not being used, if it was being used in the past, a non nil value would destroy the module/page.
      # Ensure the count of following is 0
      pages = Reports::Page.where(report_id: reports).pending_removal.count
      modules = Reports::Module.joins(:page).where(reports_pages: { report_id: reports }).
                where('reports_modules.deleted_at IS NOT NULL OR reports_pages.deleted_at IS NOT NULL').count

      puts "#{total} report(s) would be published"
      puts "This would be purging #{pages} page(s) and #{modules} module(s)"

      if (pages + modules).zero?
        puts 'Nothing to purge - safe to run.'
      else
        puts "WARNING: #{pages + modules} row(s) would be deleted for good, along with any text module"
        puts 'overrides on them. Only the builder writes deleted_at today, so rows here were most likely'
        puts 'marked by something older. Inspect them before running this for real.'
      end
      next
    end

    puts "Publishing #{total} report(s) without a snapshot"
    bar = TTY::ProgressBar.new('Publishing [:bar] :current/:total :eta', total: total)
    failed = []

    reports.find_each do |report|
      # published_by stays nil: nobody published these, the migration did.
      Reports::PublishSnapshot.call!(report, nil)
    rescue StandardError => e
      # One bad report should not strand the rest of them.
      failed << [report.id, e.message]
      Rails.logger.error("Snapshot backfill failed for report #{report.id}: #{e.message}")
    ensure
      bar.advance(1)
    end

    puts "Published #{total - failed.size} of #{total} report(s)"
    next if failed.empty?

    puts "#{failed.size} failed:"
    failed.each { |id, message| puts "  report #{id}: #{message}" }
  end
end
