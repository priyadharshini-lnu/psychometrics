# frozen_string_literal: true

namespace :one_time do
  desc 'Fix truncated comments and backfill module_id in UserReportEvents'
  task fix_truncated_comments_and_backfill_module_id: :environment do
    dry_run = ENV.fetch('DRY_RUN', 'true') == 'true'
    fixed_count = { text: 0, module: 0 }
    puts 'DRY RUN - no changes will be made' if dry_run

    UserReportEvent.where(event_type: %w[comment_added comment_removed comment_resolved comment_unresolved
                                         comment_updated]).
      find_each(batch_size: 100) do |event|
      changes = {}

      # Fix truncated text
      if %w[comment_added comment_removed].include?(event.event_type)
        truncated_text = event.details['text']
        if truncated_text.present? && truncated_text.length == 81
          audit_log = find_audit_log(event)
          if audit_log.present?
            full_text = extract_text(event, audit_log)
            if text_match?(truncated_text, full_text)
              changes['text'] = full_text
            else
              puts "No matching text found for event #{event.id}"
            end
          end
        end
      end

      # Backfill module id
      if event.details['module'].blank?
        audit_log = find_audit_log(event)
        if audit_log&.record&.reports_module_id
          changes['module'] = audit_log.record.reports_module_id
        end
      end

      if changes.empty?
        puts "No changes needed for event #{event.event_type}, ID: #{event.id}"
        next
      end

      if dry_run
        puts "Updating event #{event.event_type}, ID: #{event.id}, Changes: #{changes}"
      else
        event.update!(details: event.details.merge(changes))
        fixed_count[:text] += 1 if changes['text']
        fixed_count[:module] += 1 if changes['module']
      end
    end

    puts "\nFixed truncated texts: #{fixed_count[:text]}"
    puts "Backfilled module IDs: #{fixed_count[:module]}"
  end

  private

  def find_audit_log(event)
    action = case event.event_type
               when 'comment_added'
                 'create'
               when 'comment_removed'
                 'destroy'
               else
                 'update'
             end

    matching_logs = AuditLog.where(
      record_type: 'UserReportComment',
      action: action,
      user_id: event.initiator_id
    ).where("payload::json->>'user_report_id' = ?", event.user_report_id.to_s)

    # Add text matching condition for truncated text cases
    if %w[comment_added comment_removed].include?(event.event_type)
      json_path = action == 'create' ? "payload::json->'data'->'attributes'->>'text'" : "payload::json->>'text'"
      matching_logs = matching_logs.where("#{json_path} LIKE ?", "#{event.details['text'].strip}%")
    end

    if matching_logs.empty?
      puts "No matching audit log found for event #{event.id}"
      return
    end

    if matching_logs.count == 1
      matching_logs.first
    else
      matching_logs.min_by { |log| (log.created_at - event.created_at).abs }
    end
  end

  def extract_text(event, audit_log)
    if event.event_type == 'comment_added'
      audit_log.payload.dig('data', 'attributes', 'text')
    else
      audit_log.payload['text']
    end
  end

  def text_match?(truncated, full)
    full.present? && full.start_with?(truncated.strip) && full.length > truncated.length
  end
end
