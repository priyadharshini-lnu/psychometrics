# frozen_string_literal: true

module Threesixty
  class GetManagersQuery < Rectify::Query
    private_attr_reader :threesixty_campaign

    def initialize(threesixty_campaign: threesixty_campaign)
      @threesixty_campaign = threesixty_campaign
    end

    def query
      threesixty_campaign.
        evaluators.
        includes(:user, self_subject: :user).
        joins(participants_join_query).
        joins("LEFT JOIN relationships ON relationships.id = threesixty_participants.relationship_id").
        where(participants: { relationships: { name: 'Manager', type: :global } }).
        order(id: :desc).
        distinct(:user_id)
    end

    private

    def participants_join_query
      <<-SQL.strip_heredoc
        LEFT JOIN threesixty_participants
        ON threesixty_participants.evaluator_id = threesixty_evaluators.user_id
        AND threesixty_participants.campaign_id = #{threesixty_campaign.campaign_id}
      SQL
    end
  end
end
