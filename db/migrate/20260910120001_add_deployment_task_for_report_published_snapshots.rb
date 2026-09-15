# frozen_string_literal: true

class AddDeploymentTaskForReportPublishedSnapshots < ActiveRecord::Migration[8.0]
  def change
    DeploymentTask.add( # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
      "Run $ bundle exec rake 'data_migration:backfill_report_published_snapshots[true]' first.
      It is a dry run, it writes nothing and prints how many pages and modules would be purged.
      Only once that count is 0, run $ bundle exec rake data_migration:backfill_report_published_snapshots
      to give every report its first published snapshot. Until a report has one it keeps rendering live,
      so first builder edits reach participants immediately instead of waiting to be published."
    )
  end
end
