# frozen_string_literal: true

module AdminJobs
  module SkillsRater
    class SyncAssessmentEntities < AdminJobs::Base
      def call
        ::SkillsRater::SyncAssessmentEntities.call!(project.id)
        broadcast :ok
      end

      def generate_title_link
        {
          href: "/admin/projects/#{project.id}/taxonomy",
          label: project.name
        }
      end

      def valid?
        project.present?
      end
    end
  end
end
