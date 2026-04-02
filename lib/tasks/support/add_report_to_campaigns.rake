# frozen_string_literal: true

namespace :support do
  desc 'Add a custom_upload report to all campaigns under a project and assign to all users'
  task :add_report_to_campaigns, %i[project_id report_id] => :environment do |_t, args|
    project_id = args[:project_id]
    report_id = args[:report_id]
    campaign_ids = args.extras.map(&:to_i).presence

    if project_id.blank? || report_id.blank?
      abort 'Usage: rake support:add_report_to_campaigns[project_id,report_id,' \
            'campaign_id1,campaign_id2,...]'
    end

    project = Project.find(project_id)
    report = Report.find(report_id)
    client = project.client
    usable_license_ids = client.usable_license_id(project)
    report_family = License.where(id: usable_license_ids).
                    includes(:report_family).
                    filter_map(&:report_family).
                    find { |rf| rf.reports.exists?(id: report.id) }

    if report_family.blank?
      puts "\nErrors:"
      puts "  - Report #{report_id} has no licensed report family for client #{client.name}."
      abort
    end

    campaigns = project.project_campaigns
    campaigns = campaigns.where(id: campaign_ids) if campaign_ids.present?
    errors = []
    skipped = []

    if campaign_ids.present?
      found_ids = campaigns.pluck(:id)
      missing_ids = campaign_ids - found_ids
      missing_ids.each { |id| errors << "Campaign #{id}: Not found under project #{project_id}" }
    end

    if campaigns.none?
      puts "\nNo campaigns found matching the given IDs."
      puts "\nErrors:"
      errors.each { |msg| puts "  - #{msg}" }
      abort
    end

    puts "Project: #{project.name} (ID: #{project.id})"
    puts "Report: #{report.name} (ID: #{report.id}, provider: #{report.provider})"
    puts "Report Family: #{report_family.name} (ID: #{report_family.id})"
    puts "Campaigns: #{campaigns.count}#{' (filtered)' if campaign_ids.present?}"

    campaigns.find_each do |campaign|
      puts "\nProcessing campaign: #{campaign.name} (ID: #{campaign.id})"

      if campaign.campaign_reports.exists?(report_id: report.id)
        message = "Campaign #{campaign.id} (#{campaign.name}): Report already added"
        skipped << message
        puts "  -> #{message}"
        next
      end

      form = Campaigns::Reports::Form.new(
        report_ids: [report.id],
        report_family_id: report_family.id,
        report_access: { report.id.to_s => false },
        operation: 'add_and_allow_new_response'
      )

      Campaigns::Reports::Add.call(form, campaign, nil) do
        on(:ok) do
          user_count = campaign.campaign_users.count
          report_count = UserReport.where(campaign_id: campaign.id, report_id: report.id).count
          puts "  -> Campaign users: #{user_count}, User reports created: #{report_count}"
        end
        on(:error) do |error|
          message = "Campaign #{campaign.id} (#{campaign.name}): #{error}"
          errors << message
          puts "  !! #{message}"
        end
      end
    end

    if skipped.any?
      puts "\nSkipped campaigns:"
      skipped.each { |msg| puts "  - #{msg}" }
    end

    if errors.any?
      puts "\nErrors:"
      errors.each { |msg| puts "  - #{msg}" }
    end

    puts "\nDone!"
  end
end
