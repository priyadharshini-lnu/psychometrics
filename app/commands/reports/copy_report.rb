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
          new_page.report_id = new_report.id

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

          filter.translations.each do |translation|
            new_translation = translation.clone(false)
            new_translation.resource_id = new_report.id

            new_filter.translations << new_translation
          end

          # new_filter.translations = copy_translations(filter, new_filter, new_report)

          new_report.filters << new_filter
        end

        ['Factor', 'Occupation'].map { |type| copy_translations(type, new_report) }

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

    def copy_translations(of_type, resource)
      translations = Translation.for_report(report.id).where(translateable_type: of_type)
      translations.each do |translation|
        copy = translation.clone(false)
        copy.resource_id = resource.id

        copy.save!
      end
    end
  end
end
