# frozen_string_literal: true

# Backfill tenant_id for the audit_logs table.
#
# Runs 5 passes in order:
#   1. via client_id   — direct FK on audit_logs
#   2. via project_id  — direct FK on audit_logs
#   3. via campaign_id — direct FK on audit_logs
#   4. via record_type/record_id — polymorphic join (dynamically resolved)
#   5. via payload     — JSONB fallback for campaign_id / project_id / client_id
#

def audit_log_red(text) = "\e[31m#{text}\e[0m"

# Returns { table:, label:, count:, dry_run: } or { table:, label:, error: }
def audit_log_backfill_in_batches(conn, sql_template, batch_size: 10_000, dry_run: false, label: nil)
  table = 'audit_logs'

  if dry_run
    count = conn.select_value("SELECT COUNT(*) FROM #{table} WHERE tenant_id IS NULL").to_i
    return { table: table, label: label, count: count, dry_run: true }
  end

  min_id = conn.select_value("SELECT MIN(id) FROM #{table} WHERE tenant_id IS NULL").to_i
  max_id = conn.select_value("SELECT MAX(id) FROM #{table} WHERE tenant_id IS NULL").to_i
  total_updated = 0
  current = min_id

  while current <= max_id
    end_id = current + batch_size - 1
    sql    = sql_template.gsub(':start_id', current.to_s).gsub(':end_id', end_id.to_s)
    total_updated += conn.update(sql)
    current = end_id + 1
  end

  { table: table, label: label, count: total_updated, dry_run: false }
rescue StandardError => e
  { table: table, label: label, error: e.message }
end

def audit_log_print_results(results, mode)
  puts "\n=== Backfill audit_logs#{mode} results ===\n\n"

  results.each do |r|
    label_str = r[:label] ? " (#{r[:label]})" : ''
    name      = "#{r[:table]}#{label_str}"

    if r.key?(:error)
      puts "  #{audit_log_red('✗')} #{name}  ERROR: #{r[:error]}"
    elsif r[:dry_run]
      puts "  #{name}: #{r[:count]} rows would be updated"
    else
      puts "  #{name}: #{r[:count]} rows updated"
    end
  end

  error_count = results.count { |r| r.key?(:error) }
  puts "\n  #{error_count} error(s)" if error_count.positive?
  puts "\n=== Backfill audit_logs#{mode} complete ==="
end

namespace :tenant do
  desc 'Backfill tenant_id for audit_logs (idempotent — skips already-set rows). ' \
       'Runs after all other tables are backfilled. DRY_RUN=true for a preview.'
  task backfill_audit_logs: :environment do
    dry_run = ActiveModel::Type::Boolean.new.cast(ENV.fetch('DRY_RUN', nil))
    mode    = dry_run ? ' [DRY RUN — no changes written]' : ''
    conn    = ActiveRecord::Base.connection
    results = []

    results.concat(run_audit_log_fk_passes(conn, dry_run))
    results.concat(run_audit_log_via_record_type(conn, dry_run))
    results.concat(run_audit_log_via_payload(conn, dry_run))

    audit_log_print_results(results, mode)
  end

  def run_audit_log_fk_passes(conn, dry_run)
    [
      audit_log_backfill_in_batches(conn, <<~SQL.squish, dry_run: dry_run, label: 'via client_id'),
        UPDATE audit_logs al SET tenant_id = c.tenant_id FROM clients c
        WHERE al.tenant_id IS NULL AND al.client_id IS NOT NULL
          AND al.client_id = c.id AND c.tenant_id IS NOT NULL
          AND al.id BETWEEN :start_id AND :end_id
      SQL
      audit_log_backfill_in_batches(conn, <<~SQL.squish, dry_run: dry_run, label: 'via project_id'),
        UPDATE audit_logs al SET tenant_id = c.tenant_id FROM clients c
        WHERE al.tenant_id IS NULL AND al.project_id IS NOT NULL
          AND al.project_id = c.id AND c.tenant_id IS NOT NULL
          AND al.id BETWEEN :start_id AND :end_id
      SQL
      audit_log_backfill_in_batches(conn, <<~SQL.squish, dry_run: dry_run, label: 'via campaign_id')
        UPDATE audit_logs al SET tenant_id = ca.tenant_id FROM campaigns ca
        WHERE al.tenant_id IS NULL AND al.campaign_id IS NOT NULL
          AND al.campaign_id = ca.id AND ca.tenant_id IS NOT NULL
          AND al.id BETWEEN :start_id AND :end_id
      SQL
    ]
  end

  def run_audit_log_via_record_type(conn, dry_run)
    record_types = conn.select_values(<<~SQL.squish)
      SELECT DISTINCT record_type FROM audit_logs
      WHERE tenant_id IS NULL AND record_id IS NOT NULL AND record_type IS NOT NULL
    SQL

    table_groups = record_types.each_with_object({}) do |record_type, groups|
      model = record_type.safe_constantize
      next unless model.respond_to?(:table_name)
      next unless conn.column_exists?(model.table_name, :tenant_id)

      (groups[model.table_name] ||= []) << record_type
    end

    table_groups.map do |table, types|
      types_sql = types.map { |t| conn.quote(t) }.join(', ')
      sql_template = <<~SQL.squish
        UPDATE audit_logs al SET tenant_id = rt.tenant_id FROM #{table} rt
        WHERE al.tenant_id IS NULL AND al.record_type IN (#{types_sql})
          AND al.record_id IS NOT NULL AND al.record_id = rt.id
          AND rt.tenant_id IS NOT NULL AND al.id BETWEEN :start_id AND :end_id
      SQL
      audit_log_backfill_in_batches(conn, sql_template, dry_run: dry_run, label: "record → #{table}")
    end
  end

  def run_audit_log_via_payload(conn, dry_run)
    [
      audit_log_backfill_in_batches(conn, <<~SQL.squish, dry_run: dry_run, label: 'payload campaign_id'),
        UPDATE audit_logs al SET tenant_id = ca.tenant_id FROM campaigns ca
        WHERE al.tenant_id IS NULL AND al.payload LIKE '{%'
          AND (replace(al.payload, '\\u0000', '')::jsonb)->>'campaign_id' IS NOT NULL
          AND (replace(al.payload, '\\u0000', '')::jsonb)->>'campaign_id' <> ''
          AND (replace(al.payload, '\\u0000', '')::jsonb)->>'campaign_id' = ca.id::text
          AND ca.tenant_id IS NOT NULL AND al.id BETWEEN :start_id AND :end_id
      SQL
      audit_log_backfill_in_batches(conn, <<~SQL.squish, dry_run: dry_run, label: 'payload project_id'),
        UPDATE audit_logs al SET tenant_id = c.tenant_id FROM clients c
        WHERE al.tenant_id IS NULL AND al.payload LIKE '{%'
          AND (replace(al.payload, '\\u0000', '')::jsonb)->>'project_id' IS NOT NULL
          AND (replace(al.payload, '\\u0000', '')::jsonb)->>'project_id' <> ''
          AND (replace(al.payload, '\\u0000', '')::jsonb)->>'project_id' = c.id::text
          AND c.tenant_id IS NOT NULL AND al.id BETWEEN :start_id AND :end_id
      SQL
      audit_log_backfill_in_batches(conn, <<~SQL.squish, dry_run: dry_run, label: 'payload client_id')
        UPDATE audit_logs al SET tenant_id = c.tenant_id FROM clients c
        WHERE al.tenant_id IS NULL AND al.payload LIKE '{%'
          AND (replace(al.payload, '\\u0000', '')::jsonb)->>'client_id' IS NOT NULL
          AND (replace(al.payload, '\\u0000', '')::jsonb)->>'client_id' <> ''
          AND (replace(al.payload, '\\u0000', '')::jsonb)->>'client_id' = c.id::text
          AND c.tenant_id IS NOT NULL AND al.id BETWEEN :start_id AND :end_id
      SQL
    ]
  end

  desc 'Verify tenant_id is populated for audit_logs. ' \
       'Run after tenant:backfill_audit_logs completes.'
  task verify_audit_logs: :environment do
    conn  = ActiveRecord::Base.connection
    total = conn.select_value('SELECT COUNT(*) FROM audit_logs').to_i
    nulls = conn.select_value('SELECT COUNT(*) FROM audit_logs WHERE tenant_id IS NULL').to_i
    filled = total - nulls

    puts "\n=== Audit Logs Tenant ID Verification ===\n\n"

    puts "  audit_logs total rows: #{total}"
    puts "  audit_logs filled tenant_id: #{filled}"
    puts "  audit_logs missing tenant_id: #{nulls}"
  end
end
