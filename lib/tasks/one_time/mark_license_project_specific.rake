# frozen_string_literal: true

namespace :one_time do
  desc 'Convert an existing non-project-specific license (with usages) into a project-specific one. ' \
       'Creates a ProjectLicense per project that has used the license, backfills its used_number/usage_limit ' \
       'from historical license_usages, links those license_usages to the new project_license, and finally ' \
       'sets licenses.is_project_specific to true. Usage: ' \
       'rake one_time:mark_license_project_specific[LICENSE_ID] or ' \
       'DRY_RUN=true rake one_time:mark_license_project_specific[LICENSE_ID] to preview changes.'
  task :mark_license_project_specific, [:license_id] => :environment do |_task, args|
    ActiveSupport::Notifications.notifier.listeners_for('sql.active_record').each do |sub|
      ActiveSupport::Notifications.unsubscribe(sub)
    end
    license_id = args[:license_id]
    if license_id.blank?
      raise ArgumentError,
            'license_id is required, e.g. rake one_time:mark_license_project_specific[123]'
    end

    dry_run = ActiveModel::Type::Boolean.new.cast(ENV.fetch('DRY_RUN', 'false'))

    ActsAsTenant.without_tenant do
      license = License.find(license_id)

      if license.is_project_specific?
        puts "License #{license.id} is already marked as project specific. Nothing to do."
        next
      end

      log_start(license, dry_run)
      process_license(license, dry_run)
    end
  end

  def log_start(license, dry_run)
    puts "Processing license #{license.id} (client_id: #{license.client_id}, tenant_id: #{license.tenant_id})"
    puts 'DRY RUN: no changes will be persisted' if dry_run
  end

  def process_license(license, dry_run)
    created_count = 0
    updated_count = 0
    linked_count  = 0

    ActiveRecord::Base.transaction do
      created_count, updated_count, linked_count = backfill_project_licenses(license, dry_run)
      finalize_project_specific_flag(license, dry_run)

      raise ActiveRecord::Rollback if dry_run
    end

    puts ''
    puts '=== Summary ==='
    puts "  ProjectLicense records created : #{created_count}"
    puts "  ProjectLicense records updated : #{updated_count}"
    puts "  LicenseUsage rows linked       : #{linked_count}"
    puts "  is_project_specific flag       : #{dry_run ? 'would be set to true (dry run)' : 'set to true'}"
    puts dry_run ? '  (no changes were persisted — dry run)' : '  Done.'
  end

  def backfill_project_licenses(license, dry_run)
    project_usage_counts = license.license_usages.where(status: :active).group(:project_id).count

    if project_usage_counts.blank?
      puts 'No existing license_usages with a project_id were found for this license.'
      return [0, 0, 0]
    end

    created_count = 0
    updated_count = 0
    linked_count  = 0

    project_usage_counts.each do |project_id, active_usage_count|
      if project_id.nil?
        puts 'Skipping usages with no project_id (cannot backfill a ProjectLicense for them).'
        next
      end

      project_license, was_new = build_or_update_project_license(license, project_id, active_usage_count, dry_run)
      was_new ? created_count += 1 : updated_count += 1

      linked_count += link_license_usages_to_project_license(license, project_id, project_license, dry_run)
    end

    [created_count, updated_count, linked_count]
  end

  def finalize_project_specific_flag(license, dry_run)
    if dry_run
      puts "Would set license #{license.id}.is_project_specific = true"
    else
      license.update!(is_project_specific: true)
      puts "License #{license.id} marked as project specific."
    end
  end

  def build_or_update_project_license(license, project_id, active_usage_count, dry_run)
    project_license = ProjectLicense.find_or_initialize_by(license_id: license.id, project_id: project_id)
    is_new_record = project_license.new_record?

    project_license.enabled = true if is_new_record
    project_license.used_number = active_usage_count
    project_license.usage_limit = active_usage_count if is_new_record

    action = is_new_record ? 'Creating' : 'Updating'
    puts "  #{action} ProjectLicense for project #{project_id}: " \
         "used_number=#{project_license.used_number}, usage_limit=#{project_license.usage_limit}, " \
         "enabled=#{project_license.enabled}"

    project_license.save! unless dry_run
    [project_license, is_new_record]
  end

  def link_license_usages_to_project_license(license, project_id, project_license, dry_run)
    usages = license.license_usages.where(project_id: project_id, project_license_id: nil)
    count = usages.count
    return 0 if count.zero?

    puts "  Linking #{count} license_usage(s) for project #{project_id} to project_license " \
         "#{dry_run ? '(not yet created)' : project_license.id}"
    usages.update_all(project_license_id: project_license.id) unless dry_run
    count
  end
end
