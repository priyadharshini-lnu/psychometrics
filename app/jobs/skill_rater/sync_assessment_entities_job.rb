# frozen_string_literal: true

module SkillRater
  class SyncAssessmentEntitiesJob < ApplicationJob
    queue_as :default

    def perform(project_id)
      ::SkillRater::SyncAssessmentEntities.call!(project_id)
    end
  end
end
