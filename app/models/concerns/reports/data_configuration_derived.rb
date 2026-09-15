# frozen_string_literal: true

module Reports
  module DataConfigurationDerived
    extend ActiveSupport::Concern

    def flat_data_configuration
      (data_configuration['sections'] || []).flat_map { |section| section['data'] || [] }
    end

    def has_data_configuration_occupations?
      return false if data_configuration.blank?

      data_configuration['sections'].each do |section|
        return true if section['data'].find { |d| d['type'] == 'ranked_occupations' }
      end

      false
    end

    def data_configuration_factor_ids
      data_configuration['sections'].map do |section|
        section['data'].map do |d|
          d['factorId'] if %w[normed_factor raw_factor].include? d['type']
        end
      end.flatten.compact
    end

    def data_configuration_assessment_ids
      JsonPath.new('$..assessmentId').on(data_configuration).uniq
    end

    def pdf_dimension
      height = props&.dig('sizes', 'height') || 1100
      width = props&.dig('sizes', 'width') || 850
      page_height_increment = 0
      page_width_increment = 0
      page_height_increment = 1 if [827].include?(height)
      page_width_increment = -1 if [1169, 1100].include?(height)
      {
        width: "#{width + page_width_increment}px",
        height: "#{height + page_height_increment}px"
      }
    end
  end
end
