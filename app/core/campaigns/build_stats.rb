# frozen_string_literal: true

module Campaigns
  class BuildStats < BaseCommand
    private_attr_reader :campaign, :campaign_users_active_in

    def initialize(campaign, campaign_users_active_in)
      @campaign = campaign
      @campaign_users_active_in = campaign_users_active_in
    end

    def call
      broadcast(:ok, {
        users: build_users,
        assessments: build_assessments
      })
    end

    private

    def build_users
      query = CampaignUser.select(:status, 'count(id) as status_count').
              group(:status).where(campaign_id: campaign.id, active: campaign_users_active_in).to_sql
      ActiveRecord::Base.connection.execute(query).to_a.
        each_with_object({
          'total' => campaign.campaign_users.where(active: campaign_users_active_in).count
        }) do |row, res|
        res[UserAssessment.statuses.key(row['status'])] = row['status_count']
      end
    end

    def build_assessments
      query = UserAssessment.joins(:campaign_user).select(
        :assessment_id, :status, 'count(DISTINCT user_assessments.id) as status_count'
      ).group(:assessment_id, :status).
              where(campaign_id: campaign.id, campaign_users: { active: campaign_users_active_in }).to_sql
      user_assessments_count_by_status = ActiveRecord::Base.connection.execute(query).to_a.
                                         index_by do |us|
        [us['assessment_id'],
         UserAssessment.statuses.key(us['status'])]
      end

      statuses = UserAssessment.statuses.keys
      campaign.campaign_users.where(active: campaign_users_active_in).
        includes(assessments: :campaign_assessments).
        where(campaign_assessments: { campaign_id: campaign.id }).flat_map(&:assessments).uniq.map do |a|
          statuses.each_with_object({ 'id' => a.id, 'name' => a.name }) do |status, result|
            result[status] = user_assessments_count_by_status[[a.id, status]]&.try(:[], 'status_count') || 0
          end
        end
    end
  end
end
