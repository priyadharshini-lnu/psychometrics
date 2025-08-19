# frozen_string_literal: true

module PsyDebug
  class Base
    private_attr_reader :record

    def initialize(record)
      @record = record
    end

    def nav
      navigation_objects.map do |object|
        resource_name = object.class.name
        resource_name = 'Project' if resource_name == 'Client' && object.project?
        "#{object.name} (#{resource_name}@#{object.id})"
      end.join(' > ')
    end

    def navigation_objects
      project = campaign&.project
      if record.respond_to?(:project) && (record.project.is_a?(Project) || record.project.is_a?(Client))
        project ||= record.project
      end
      client = project&.client
      [
        client,
        project,
        campaign
      ].compact
    end

    def campaign
      @campaign ||= record.campaign if record.respond_to?(:campaign) && record.campaign.is_a?(Campaign)
    end
  end
end
