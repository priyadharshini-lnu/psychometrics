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
      execute_sql(<<~SQL.squish, snapshot.id, report.id)
        UPDATE translations AS snapshot
        SET props = draft.props, data = draft.data, updated_at = now()
        FROM translations AS draft
        WHERE snapshot.resource_type = 'Reports::PublishedSnapshot'
          AND snapshot.resource_id = ?
          AND draft.resource_type = 'Report'
          AND draft.resource_id = ?
          AND draft.translateable_type = snapshot.translateable_type
          AND draft.translateable_id   = snapshot.translateable_id
          AND draft.locale             = snapshot.locale
          AND (draft.props::text IS DISTINCT FROM snapshot.props::text
               OR draft.data IS DISTINCT FROM snapshot.data)
      SQL
    end

    def insert_new_translations(snapshot)
      execute_sql(<<~SQL.squish, snapshot.id, report.id, snapshot.id)
        INSERT INTO translations (translateable_type, translateable_id, props, data, locale,
                                  resource_type, resource_id, created_at, updated_at)
        SELECT draft.translateable_type, draft.translateable_id, draft.props, draft.data, draft.locale,
               'Reports::PublishedSnapshot', ?, now(), now()
        FROM translations AS draft
        WHERE draft.resource_type = 'Report' AND draft.resource_id = ?
          AND NOT EXISTS (
            SELECT 1 FROM translations AS snapshot
            WHERE snapshot.resource_type = 'Reports::PublishedSnapshot'
              AND snapshot.resource_id = ?
              AND snapshot.translateable_type = draft.translateable_type
              AND snapshot.translateable_id   = draft.translateable_id
              AND snapshot.locale             = draft.locale
          )
      SQL
    end

    def delete_stale_translations(snapshot)
      execute_sql(<<~SQL.squish, snapshot.id, report.id)
        DELETE FROM translations AS snapshot
        WHERE snapshot.resource_type = 'Reports::PublishedSnapshot'
          AND snapshot.resource_id = ?
          AND NOT EXISTS (
            SELECT 1 FROM translations AS draft
            WHERE draft.resource_type = 'Report' AND draft.resource_id = ?
              AND draft.translateable_type = snapshot.translateable_type
              AND draft.translateable_id   = snapshot.translateable_id
              AND draft.locale             = snapshot.locale
          )
      SQL
    end

    def execute_sql(sql, *binds)
      ActiveRecord::Base.connection.execute(ApplicationRecord.sanitize_sql([sql, *binds]))
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
