# frozen_string_literal: true

module AdminJobs
  class ExportCampaignTranslationsJob < BaseExportCsv
    def call
      job_record.update(total_tasks: record_count)
      super
      job_record.complete!
    end

    def generate_details
      [[I18n.t('administration.campaigns.bulk_import_translations.details'), file_link]]
    end

    def headers
      ['Campaign ID'] + I18n.available_locales.map do |locale|
        [I18n.t("languages.#{locale}"), locale].join(' / ')
      end
    end

    def records_for_export
      project.project_campaigns.active.includes(:translations).order(:id)
    end

    def data_row(campaign)
      translations = campaign.translations.group_by(&:locale)
      [campaign.id] + I18n.available_locales.map do |locale|
        if locale.to_s == 'en'
          campaign.name.to_s
        else
          translations[locale.to_s]&.first&.name.to_s
        end
      end
    end

    def file_name
      "#{project.name}-campaign-name-translations-template.csv"
    end

    private

    def project
      @project ||= Project.find(record.data['project_id'])
    end

    def flush_threshold
      (record_count / 100).to_i.clamp(100, 1000)
    end

    def record_count
      @record_count ||= records_for_export.count(:all)
    end
  end
end
