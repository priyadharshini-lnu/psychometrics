# frozen_string_literal: true

module Reports
  class GetDataConfigurationResources < BaseCommand
    private_attr_reader :report, :configuration_sections

    def initialize(report)
      @report = report
      @configuration_sections = report.data_configuration['sections']
    end

    def call
      return broadcast :ok, {} if configuration_sections.blank?

      broadcast :ok, { factor_names: factor_names, questions: questions }
    end

    private

    def questions
      Question.where(id: all_question_ids).index_by(&:id)
    end

    def factor_names
      Factor.
        joins("LEFT JOIN factors_aliases ON factors_aliases.factor_id = factors.id AND report_id = #{report.id}").
        select('factors.id, COALESCE(factors_aliases.name, factors.name) as name').
        where(id: all_factor_ids).
        each_with_object({}) do |factor, acc|
          acc[factor.id] = factor.name
        end
    end

    def all_factor_ids
      configuration_sections.map do |section|
        section['data'].map { |sub_header| sub_header['factorId'] }.compact
      end.flatten
    end

    def all_question_ids
      configuration_sections.map do |section|
        section['data'].map { |sub_header| sub_header['questionId'] }.compact
      end.flatten
    end
  end
end
