# frozen_string_literal: true

module SkillsRater
  class SyncAssessmentEntitiesJob < ApplicationJob
    queue_as :default

    def perform(project_id)
      ::SkillsRater::SyncAssessmentEntities.call!(project_id)
    end
  end
end
