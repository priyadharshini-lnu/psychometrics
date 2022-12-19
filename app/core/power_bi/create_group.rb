# frozen_string_literal: true

module PowerBi
  class CreateGroup < Base
    private_attr_reader :project

    def initialize(project)
      @project = project
    end

    def call
      group_name = "#{project.id}-#{project.name}"
      response = post('groups?workspaceV2=true', { name: group_name })
      parsed_response = JSON.parse(response.body)
      return broadcast :ok, parsed_response if response.status == 200

      if parsed_response.dig('error', 'code') == 'PowerBIEntityAlreadyExists'
        response = get('groups', { '$filter' => "name eq '#{group_name}'" })
        return broadcast :ok, JSON.parse(response.body).dig('value', 0) if response.status == 200
      end

      broadcast :error, JSON.parse(response.body)
    end
  end
end
