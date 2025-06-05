# frozen_string_literal: true

module Skillvue
  class SubscribeToWebhookJob < ApplicationJob
    queue_as :default

    def perform(project_id)
      project = Project.find_by(id: project_id)
      return unless project

      Skillvue::SubscribeToWebhook.call!(project)
    end
  end
end
