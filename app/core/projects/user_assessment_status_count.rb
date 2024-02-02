# frozen_string_literal: true

module Projects
  class UserAssessmentStatusCount < BaseCommand
    private_attr_reader :project, :scope

    def initialize(project, scope)
      @project = project
      @scope = scope
    end

    def call
      status_counts =
        scope.
        joins(:campaign).
        where(campaigns: { project_id: project.id }).
        group(:campaign_id, :subject_id, :status).
        count.
        each_with_object({}) do |((campaign_id, user_id, status), count), hash|
          key = [campaign_id, user_id]
          hash[key] ||= { 'total' => 0 }
          hash[key][status] = count
          hash[key]['total'] += count
        end

      broadcast :ok, status_counts
    end
  end
end
