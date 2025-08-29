# frozen_string_literal: true

module Campaigns
  class AIArtifactDependenciesUpdateUtil < BaseCommand
    def initialize(ai_artifact:, dependencies_params:)
      @ai_artifact = ai_artifact
      @dependencies_params = dependencies_params
    end

    def call
      updated_dependencies = extract_dependencies_from_params(dependencies_params)
      existing_dependencies = get_existing_dependencies

      existing_tuples = existing_dependencies.map { |dep| [dep[:dependency_type], dep[:dependency_id]] }
      updated_tuples = updated_dependencies.map { |dep| [dep[:dependency_type], dep[:dependency_id]] }

      # Dependencies to mark for destruction
      destroy_tuples = existing_tuples - updated_tuples
      marked_destroy_dependencies = existing_dependencies.select do |dep|
        destroy_tuples.include?([dep[:dependency_type], dep[:dependency_id]])
      end.map { |dep| dep.merge(_destroy: true) }

      # New dependencies to create
      new_dependencies = updated_dependencies.reject do |dep|
        existing_tuples.include?([dep[:dependency_type], dep[:dependency_id]])
      end

      result = new_dependencies + marked_destroy_dependencies
      broadcast(:ok, result)
    end

    private

    attr_reader :ai_artifact, :dependencies_params

    def extract_dependencies_from_params(value)
      dependencies = []

      (value['campaign_factors'] || []).each do |factor_data|
        next unless factor_data['id']

        dependencies << { dependency_type: 'CampaignFactor', dependency_id: factor_data['id'].to_i }
      end

      (value['questions'] || []).each do |question_data|
        dependencies << { dependency_type: 'Question', dependency_id: question_data['id'].to_i }
      end

      (value['sheet_columns'] || []).each do |column_data|
        next unless column_data['id']

        dependencies << { dependency_type: 'SheetColumn', dependency_id: column_data['id'].to_i }
      end

      dependencies
    end

    def get_existing_dependencies
      return [] unless ai_artifact.persisted?

      ai_artifact.dependencies.map do |dep|
        {
          id: dep.id,
          dependency_type: dep.dependency_type,
          dependency_id: dep.dependency_id
        }
      end
    end
  end
end
