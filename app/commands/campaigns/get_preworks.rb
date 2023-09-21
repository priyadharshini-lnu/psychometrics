# frozen_string_literal: true

module Campaigns
  class GetPreworks < BaseCommand
    private_attr_reader :campaign_id, :user_id

    def initialize(campaign_id, user_id = nil)
      @campaign_id = campaign_id
      @user_id = user_id
    end

    def call
      broadcast(:ok, preworks_status_by_user)
    end

    private

    def users_campaign_assessments
      @users_campaign_assessments ||= UserAssessment.where(campaign_id: campaign_id).with_campaign_assessments
    end

    def preworks_status_by_user
      preworks.group_by do |user_and_status, _count|
        user_and_status.shift
      end.transform_values do |count|
        {
          'total' => count.sum(&:last),
          'completed' => count.find { |c| c.flatten.first == 'completed' }&.last || 0
        }
      end
    end

    def preworks
      return unless users_campaign_assessments

      @preworks ||= users_campaign_assessments.
                    where('campaign_assessments.prework = true').
                    group('user_assessments.subject_id', 'user_assessments.status')

      @preworks = @preworks.where(user_assessments: { subject_id: user_id }) if user_id
      @preworks.count
    end
  end
end
