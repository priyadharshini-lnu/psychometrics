# frozen_string_literal: true

class Api::V2::Administration::Projects::CampaignResource < Api::V2::Administration::BaseResource
  model_name 'Campaign'

  attributes :name, :status, :tag_list, :campaign_reports, :candidates_count

  ransack_filters %i[name_cont]

  filter :tagged_with, apply: lambda { |records, tags, _options|
    records.tagged_with(tags, any: true)
  }

  def tag_list
    @model.all_tags_list
  end

  def campaign_reports
    @model.campaign_reports.filter_map do |cr|
      report = cr.report
      next unless report

      report_locales = ([report.default_language] + (report.other_languages || [])).compact.uniq

      {
        id: cr.id.to_s,
        default_language: cr.effective_default_language,
        available_languages: report_locales,
        report: { id: report.id.to_s, name: report.name, description: report.description,
                  report_type: report_type_for(report) }
      }
    end
  end

  def candidates_count
    if @model.association(:campaign_users).loaded?
      @model.campaign_users.count(&:active)
    else
      @model.campaign_users.where(active: true).count
    end
  end

  def self.records(opts = {})
    project_id = opts.dig(:context, :params, :project_id)

    super.
      where(project_id: project_id).
      where(type: Campaign.types[:common]).
      includes(:taggings, :tags, :campaign_users, campaign_reports: :report)
  end

  def self.available_tags(project_id:)
    opts = { context: { user: Current.user, params: { project_id: project_id } } }

    records(opts).
      joins(:tags).
      group('tags.id', 'tags.name').
      order('tags.name').
      count('DISTINCT campaigns.id').map do |(id, name), campaigns_count|
        { id: id, name: name, campaigns_count: campaigns_count }
      end
  end

  private

  def report_type_for(report)
    return 'csv'           if report.data_only?
    return 'custom_upload' if report.provider_custom_upload?

    'pdf'
  end
end
