# frozen_string_literal: true
#
# Returns the following format
# {
#   <subject_id>: {
#     all: { <relationship_id>: <counter>, <relationship_id>: <counter> },
#     completed: { <relationship_id>: <counter>, <relationship_id>: <counter> }
#   }
# }
#
module Threesixty
  module Subjects
    class CalcSubjectEvaluatorsCounters < BaseCommand
      def initialize(user_ids, threesixty_campaign, types = %i[all completed])
        @user_ids = user_ids
        @campaign = threesixty_campaign.campaign
        @option = threesixty_campaign.option
        @types = types
      end

      def call
        result = user_ids.each_with_object({}) do |user_id, result|
          result[user_id] = {} unless result[user_id]
          types.each do |type|
            result[user_id][type] = gather_relationships(user_id, type)
          end
        end
        broadcast :ok, result
      end

      def gather_relationships(user_id, type)
        raw_result = send(type)[user_id]
        return {} unless raw_result

        raw_result.each_with_object({}) do |participant, res|
          res[participant.relationship_id] = participant.cache_counter
        end
      end

      private

      attr_reader :user_ids, :option, :campaign, :types

      def all
        @all ||= Participant.select('count(id) as cache_counter, subject_id, relationship_id').
                 active.actual_by_options(option).
                 where(subject_id: user_ids, campaign: campaign).
                 group(:subject_id, :relationship_id).group_by(&:subject_id)
      end

      def completed
        @completed ||=
          if option.participants.dig('manager', 'can_approves_evaluations')
            Participant.select('count(id) as cache_counter, subject_id, relationship_id').active.actual_by_options(option).
              where(subject_id: user_ids, manager_evaluation_status: :approved, campaign: campaign).
              group(:subject_id, :relationship_id).
              group_by(&:subject_id)
          else
            params = { user_ids: user_ids, campaign_id: campaign.id }
            Participant.active.actual_by_options(option).find_by_sql([sql, params]).
              group_by(&:subject_id)
          end
      end

      def sql
        <<-SQL.strip_heredoc
        SELECT count(participants.id) as cache_counter, participants.subject_id, relationship_id
        FROM participants
        LEFT JOIN users_results ur on ur.subject_id = participants.subject_id and ur.evaluator_id = participants.evaluator_id
        WHERE participants.subject_id in (:user_ids) AND participants.campaign_id = :campaign_id and ur.status = 2
        GROUP BY (participants.subject_id, relationship_id)
        SQL
      end
    end
  end
end
