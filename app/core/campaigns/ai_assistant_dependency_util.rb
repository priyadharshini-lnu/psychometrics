# frozen_string_literal: true

module Campaigns
  class AIAssistantDependencyUtil < BaseCommand
    def initialize(resource:, dependencies_params:)
      @resource = resource
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

    attr_reader :resource, :dependencies_params

    # Override this method in subclasses to define how to extract dependencies
    def extract_dependencies_from_params(_value)
      raise NotImplementedError, "#{self.class} must implement #extract_dependencies_from_params"
    end

    def get_existing_dependencies
      return [] unless resource.persisted?

      resource.dependencies.map do |dep|
        {
          id: dep.id,
          dependency_type: dep.dependency_type,
          dependency_id: dep.dependency_id
        }
      end
    end
  end
end
