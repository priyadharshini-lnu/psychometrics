# frozen_string_literal: true

module AdminJobs
  class ExportFactorTranslations < BaseExportCsv
    def valid?
      dimension.present?
    end

    def generate_details
      [[I18n.t('frontend.campaign.users.actions.export_reports_and_assessments.details'), file_link]]
    end

    def headers
      %w[ID] + I18n.available_locales.map do |locale|
                 [I18n.t("languages.#{locale}"), locale].join(' / ')
               end
    end

    def records_for_export
      dimension.all_factors.includes(:translations).order(:id)
    end

    def data_row(factor)
      translations = factor.translations.group_by(&:locale)
      names = []
      descriptions = []
      I18n.available_locales.map do |locale|
        (names << translations[locale.to_s].try(:first).try(:name)) || ''
        (descriptions << translations[locale.to_s].try(:first).try(:description)) || ''
      end

      [
        ["#{factor.id}#Name", *names],
        ["#{factor.id}#Description", *descriptions]
      ]
    end

    def file_name
      "factor-translations-#{dimension.id}.csv"
    end

    def dimension
      @dimension ||= Dimension.find_by(id: record.data['dimension_id'])
    end
  end
end
