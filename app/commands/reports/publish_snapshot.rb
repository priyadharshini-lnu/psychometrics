# frozen_string_literal: true

module Reports
  class PublishSnapshot < BaseCommand
    private_attr_reader :report, :published_by

    def initialize(report, published_by)
      @report       = Report.includes(pages: :modules).find(report.id)
      @published_by = published_by
    end

    def call
      snapshot = nil

      ActiveRecord::Base.transaction do
        purge_removed_records
        snapshot = upsert_snapshot
        sync_translations(snapshot)
      end

      broadcast :ok, snapshot
    end

    private

    # A module when removed(soft delete) from draft report(in builder)
    # would be deleted on publish
    def purge_removed_records
      Reports::Module.joins(:page).
        where(reports_pages: { report_id: report.id }).
        pending_removal.destroy_all

      Reports::Page.where(report_id: report.id).pending_removal.destroy_all
    end

    def sync_translations(snapshot)
      update_matching_translations(snapshot)
      insert_new_translations(snapshot)
      delete_stale_translations(snapshot)
    end

    def update_matching_translations(snapshot)
      sql = <<~SQL.squish
        UPDATE translations AS t_snapshot
        SET props = t_draft.props, data = t_draft.data, updated_at = now()
        FROM translations AS t_draft
        WHERE t_snapshot.resource_type = 'Reports::PublishedSnapshot'
          AND t_snapshot.resource_id = :snapshot_id
          AND t_draft.resource_type = 'Report'
          AND t_draft.resource_id = :report_id
          AND t_draft.translateable_type = t_snapshot.translateable_type
          AND t_draft.translateable_id   = t_snapshot.translateable_id
          AND t_draft.locale             = t_snapshot.locale
          AND (t_draft.props::text IS DISTINCT FROM t_snapshot.props::text
               OR t_draft.data IS DISTINCT FROM t_snapshot.data)
      SQL

      execute_sql(sql, snapshot_id: snapshot.id, report_id: report.id)
    end

    def insert_new_translations(snapshot)
      sql = <<~SQL.squish
        INSERT INTO translations (translateable_type, translateable_id, props, data, locale,
                                  resource_type, resource_id, created_at, updated_at)
        SELECT t_draft.translateable_type, t_draft.translateable_id, t_draft.props, t_draft.data, t_draft.locale,
               'Reports::PublishedSnapshot', :snapshot_id, now(), now()
        FROM translations AS t_draft
        WHERE t_draft.resource_type = 'Report' AND t_draft.resource_id = :report_id
          AND NOT EXISTS (
            SELECT 1 FROM translations AS t_snapshot
            WHERE t_snapshot.resource_type = 'Reports::PublishedSnapshot'
              AND t_snapshot.resource_id = :snapshot_id
              AND t_snapshot.translateable_type = t_draft.translateable_type
              AND t_snapshot.translateable_id   = t_draft.translateable_id
              AND t_snapshot.locale             = t_draft.locale
          )
      SQL

      execute_sql(sql, snapshot_id: snapshot.id, report_id: report.id)
    end

    def delete_stale_translations(snapshot)
      sql = <<~SQL.squish
        DELETE FROM translations AS t_snapshot
        WHERE t_snapshot.resource_type = 'Reports::PublishedSnapshot'
          AND t_snapshot.resource_id = :snapshot_id
          AND NOT EXISTS (
            SELECT 1 FROM translations AS t_draft
            WHERE t_draft.resource_type = 'Report' AND t_draft.resource_id = :report_id
              AND t_draft.translateable_type = t_snapshot.translateable_type
              AND t_draft.translateable_id   = t_snapshot.translateable_id
              AND t_draft.locale             = t_snapshot.locale
          )
      SQL

      execute_sql(sql, snapshot_id: snapshot.id, report_id: report.id)
    end

    def execute_sql(sql, binds)
      ActiveRecord::Base.connection.execute(ApplicationRecord.sanitize_sql([sql, binds]))
    end

    def upsert_snapshot
      snapshot = Reports::PublishedSnapshot.find_or_initialize_by(report_id: report.id)
      snapshot.data         = Reports::BuildSnapshotData.call!(report)
      snapshot.published_by = published_by
      snapshot.published_at = Time.current
      snapshot.save!
      snapshot
    end
  end
end
