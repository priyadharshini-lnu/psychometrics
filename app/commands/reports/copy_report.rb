# frozen_string_literal: true

module Reports
  class CopyReport < Rectify::Command
    def initialize(report_id)
      @report = Report.includes(:pages, :modules, :filters).find_by(id: report_id)
    end

    def call
      new_report = ActiveRecord::Base.transaction do
        new_report = report.clone
        new_report.save!

        report.pages.each do |page|
          new_page = make_copy(page, new_report, 'report_id')

          page.modules.each do |mod|
            new_module = make_copy(mod, new_page, 'page_id')

            mod.translations.each do |translation|
              new_translation = make_copy(translation, new_report)

              new_module.translations << new_translation
            end

            new_page.modules << new_module
          end

          new_report.pages << new_page
        end

        report.filters.each do |filter|
          new_filter = make_copy(filter, new_report)

          filter.translations.each do |translation|
            new_translation = make_copy(translation, new_report)

            new_filter.translations << new_translation
          end

          new_report.filters << new_filter
        end

        %w[Factor Occupation].map { |type| copy_translations(type, report, new_report) }

        new_report
      end
      broadcast :ok, new_report
    rescue ActiveRecord::RecordInvalid
      broadcast(:error)
    end

    private

    attr_reader :report

    def copy_translations(type, of_resource, into_resource)
      translations = Translation.for_report(of_resource.id).where(translateable_type: type)
      translations.each do |translation|
        copy = make_copy(translation, into_resource)

        copy.save!
      end
    end

    def make_copy(object, resource, resource_key = 'resource_id')
      copy = object.clone(false)
      copy[resource_key] = resource.id
      copy
    end
  end
end
