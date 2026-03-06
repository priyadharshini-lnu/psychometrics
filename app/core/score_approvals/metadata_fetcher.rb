# frozen_string_literal: true

module ScoreApprovals
  class MetadataFetcher < BaseCommand
    def initialize(current_user, filter: nil)
      @current_user = current_user
      @filter = filter
    end

    def call
      broadcast :ok, {
        campaigns: campaigns_data,
        projects: projects_data,
        clients: clients_data,
        assessments: assessments_data
      }
    end

    private

    def campaigns_data
      campaigns.map { |campaign| slice_campaign_data(campaign) }
    end

    def projects_data
      projects.map { |project| slice_project_data(project) }
    end

    def clients_data
      clients.map { |client| slice_client_data(client) }
    end

    def assessments_data
      assessments.map { |assessment| slice_assessment_data(assessment) }
    end

    def qc_users_data
      qc_users.map { |user| slice_user_data(user) }
    end

    def approvers_data
      approvers.map { |user| slice_user_data(user) }
    end

    def campaigns
      Campaign.joins(:ai_score_approvals).merge(score_approvals).distinct
    end

    def projects
      Project.where(id: campaigns.pluck(:project_id))
    end

    def clients
      Client.where(id: projects.map(&:parent_id))
    end

    def assessments
      Assessment.where(id: score_approvals.pluck(:assessment_id))
    end

    def approvers
      User.where(id: score_approvals.pluck(:approver_user_id).flatten.uniq.compact)
    end

    def score_approvals
      @score_approvals ||= begin
        @score_approvals = if @filter && @filter[:my_tasks] == 'true'
                             AI::ScoringApprovalSetting.user_tasks(current_user)
                           else
                             AI::ScoringApprovalSetting.scoring_approvals(current_user)
                           end

        if @filter && @filter[:approval_status_in] == 'approved'
          @score_approvals = AI::ScoringApprovalSetting.approved_for(current_user)
        end

        @score_approvals
      end
    end

    def slice_campaign_data(campaign)
      campaign.slice(:id, :name)
    end

    def slice_project_data(project)
      project.slice(:id, :name)
    end

    def slice_client_data(client)
      client.slice(:id, :name)
    end

    def slice_assessment_data(assessment)
      assessment.slice(:id, :name)
    end

    def slice_user_data(user)
      user.slice(:id).merge(name: user.decorate.display_name)
    end

    attr_reader :current_user, :filter
  end
end
