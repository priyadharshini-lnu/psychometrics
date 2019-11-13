# frozen_string_literal: true

module Reports
  class CopyReport < Rectify::Command
    def initialize(report_id)
      @report = Report.includes(:pages, :modules, :filters).find_by(id: report_id)
    end

    # rubocop:disable Metrics/AbcSize
    def call
      # rubocop:disable Metrics/BlockLength
      new_report = ActiveRecord::Base.transaction do
        new_report = report.clone
        new_report.save!

        report.pages.each do |page|
          new_page = page.clone(false)
          new_page.report_id = report.id

          page.modules.each do |mod|
            new_module = mod.clone(false)
            new_module.page_id = new_page.id

            mod.translations.each do |translation|
              new_translation = translation.clone(false)
              new_translation.resource_id = new_report.id

              new_module.translations << new_translation
            end

            new_page.modules << new_module
          end

          new_report.pages << new_page
        end

        report.filters.each do |filter|
          new_filter = filter.clone(false)
          new_filter.report_id = new_report.id

          new_filter.translations.each do |translation|
            new_translation = translation.clone(false)
            new_translation.resource_id = new_report.id

            new_filter.translations << new_translation
          end

          new_report.filters << new_filter
        end

        factor_translations = Translation.for_report(report.id).where(translateable_type: 'Factor')
        factor_translations.each do |translation|
          new_translation = translation.clone(false)
          new_translation.resource_id = new_report.id

          new_translation.save!
        end

        occupation_translations = Translation.for_report(report.id).where(
          translateable_type: 'Occupation'
        )
        occupation_translations.each do |translation|
          new_translation = translation.clone(false)
          new_translation.resource_id = new_report.id

          new_translation.save!
        end

        new_report
      end
      # rubocop:enable Metrics/BlockLength
      broadcast :ok, new_report
    rescue ActiveRecord::RecordInvalid
      broadcast(:error)
    end
    # rubocop:enable Metrics/AbcSize

    private

    attr_reader :report
  end
end
