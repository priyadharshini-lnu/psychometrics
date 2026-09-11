# frozen_string_literal: true

module Reports
  class PublishedReader < BaseReader
    def initialize(report)
      super
      @snapshot = report.published_snapshot
    end

    def translation_scope
      Translation.for_snapshot(@snapshot.id)
    end

    def props
      data.dig('report', 'props') || {}
    end

    def styles
      data.dig('report', 'styles') || {}
    end

    def data_configuration
      data.dig('report', 'data_configuration') || {}
    end

    def data_sheet_columns
      data.dig('report', 'data_sheet_columns') || []
    end

    def external_settings
      data.dig('report', 'external_settings') || {}
    end

    def pages
      @pages ||= hydrate_pages(data)
    end

    def filters
      @filters ||= (data['filters'] || []).map { |attrs| hydrate_record(Reports::Filter, attrs) }
    end

    def campaign_factors
      @campaign_factors ||= (data['campaign_factors'] || []).map { |attrs| hydrate_record(Reports::CampaignFactor, attrs) }
    end

    def campaign_ai_artifacts
      @campaign_ai_artifacts ||= (data['campaign_ai_artifacts'] || []).map do |attrs|
        hydrate_record(Reports::CampaignAIArtifact, attrs)
      end
    end

    # Reads from the snapshot's pages/modules, not the live (possibly draft)
    # association.
    def modules_empty?
      (data['pages'] || []).all? { |page| (page['modules'] || []).empty? }
    end

    private

    def hydrate_pages(data)
      (data['pages'] || []).map do |page_hash|
        page = hydrate_record(Reports::Page, page_hash.except('modules'))
        mods = (page_hash['modules'] || []).map { |mod_hash| hydrate_record(Reports::Module, mod_hash) }
        page.association(:modules).target = mods
        page.association(:modules).loaded!
        page
      end
    end

    def hydrate_record(klass, attrs)
      klass.instantiate(klass.column_defaults.merge(attrs)).tap(&:readonly!)
    end

    def data
      @snapshot.data
    end
  end
end
