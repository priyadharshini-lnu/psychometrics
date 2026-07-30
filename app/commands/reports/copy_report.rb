# frozen_string_literal: true

module Reports
  class CopyReport < BaseCommand
    private_attr_reader :report, :owner_id, :user, :new_report_name

    def initialize(report_id, user, owner_id = nil, new_report_name: nil)
      @report = Report.includes(:pages, :modules, :filters, :campaign_factors).find_by(id: report_id)
      @user = user
      @new_report_name = new_report_name
      @owner_id = owner_id
    end

    def call
      new_report = ActiveRecord::Base.transaction do
        new_report = report.clone
        new_report.name = new_report_name if new_report_name
        new_report.created_by = user
        new_report.owner_id = owner_id
        new_report.save!

        copy_pages(report, new_report)

        filter_map = copy_filters(report, new_report)
        update_modules(new_report, filter_map)
        copy_campaign_factors(report, new_report)
        %w[Factor Occupation].map { |type| copy_translations(type, report, new_report) }

        new_report
      end
      broadcast :ok, new_report
    rescue ActiveRecord::RecordInvalid
      broadcast(:error)
    end

    private

    def copy_translations(type, of_resource, into_resource)
      translations = Translation.for_report(of_resource.id).where(translateable_type: type)
      translations.each do |translation|
        copy = make_copy(translation, into_resource)

        copy.save!
      end
    end

    def make_copy(object, resource, resource_key = 'resource_id')
      copy = object.dup
      copy[resource_key] = resource.id
      copy
    end

    def copy_pages(old_report, new_report)
      old_report.pages.each do |page|
        new_page = make_copy(page, new_report, 'report_id')

        new_page = copy_modules(page, new_page, new_report)

        new_report.pages << new_page
      end
    end

    def copy_modules(old_page, new_page, of_report)
      old_page.modules.each do |mod|
        new_module = make_copy(mod, new_page, 'page_id')

        mod.translations.for_report(old_page.report_id).each do |translation|
          new_translation = make_copy(translation, of_report)

          new_module.translations << new_translation
        end

        new_page.modules << new_module
      end

      new_page
    end

    def copy_filters(old_report, new_report)
      filter_map = {}
      old_report.filters.each do |filter|
        new_filter = make_copy(filter, new_report, 'report_id')
        new_filter.save!
        filter_map[filter.id] = new_filter.id
        filter.translations.for_report(old_report.id).each do |translation|
          new_translation = make_copy(translation, new_report)

          new_filter.translations << new_translation
        end

        new_report.filters << new_filter
      end
      filter_map
    end

    def copy_campaign_factors(old_report, new_report)
      old_report.campaign_factors.each do |campaign_factor|
        new_campaign_factor = make_copy(campaign_factor, new_report, 'report_id')
        new_campaign_factor.save!

        campaign_factor.translations.for_report(old_report.id).each do |translation|
          new_translation = make_copy(translation, new_report)

          new_campaign_factor.translations << new_translation
        end

        new_report.campaign_factors << new_campaign_factor
      end
    end

    def update_modules(report, filter_map) # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
      report.modules.each do |mod|
        next unless mod.props

        if mod.props['filters'].is_a?(Array) && mod.props['filters'].present?
          new_filters = mod.props['filters'].map { |id| filter_map[id] }
          mod.update(props: mod.props.merge('filters' => new_filters))
        end

        if mod.props['filter'].is_a?(Array) && mod.props['filter'].present?
          new_filters = mod.props['filter'].map { |id| filter_map[id] }
          mod.update(props: mod.props.merge('filter' => new_filters))
        end

        if mod.props['filter'].is_a?(Integer)
          mod.update(props: mod.props.merge('filter' => filter_map[mod.props['filter']]))
        end

        if mod.props['filters'].is_a?(Integer)
          mod.update(props: mod.props.merge('filters' => filter_map[mod.props['filters']]))
        end
      end
    end
  end
end
