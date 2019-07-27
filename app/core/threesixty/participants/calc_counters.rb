# frozen_string_literal: true

module Threesixty
  module Participants
    class CalcCounters < BaseCommand
      def initialize(user_ids, threesixty_campaign)
        @user_ids = user_ids
        @threesixty_campaign = threesixty_campaign
        @option = threesixty_campaign.option
      end

      def call
        result = user_ids.each_with_object({}) do |user_id, result|
          result[user_id] = {} unless result[user_id]
          result[user_id][:total_evaluators] = total_evaluators[user_id].try(:cache_counter) || 0
          result[user_id][:total_evaluations] = total_evaluations[user_id].try(:total_evaluations_count) || 0
          result[user_id][:completed_evaluations] = completed_evaluations[user_id].try(:completed_evaluations_count) || 0
          result[user_id][:completed_evaluators] = completed_evaluators[user_id].try(:cache_counter) || 0
        end
        broadcast :ok, result
      end

      private

      attr_reader :user_ids, :option, :threesixty_campaign

      def total_evaluators
        @total_evaluators ||= threesixty_campaign.participants.select('count(id) as cache_counter, subject_id').active.actual_by_options(option).where(subject_id: user_ids).
          group(:subject_id).index_by(&:subject_id)
      end

      def total_evaluations
        @total_evaluations ||= Threesixty::Participants::GetTotalEvaluations.call!(threesixty_campaign, user_ids)
      end

      def completed_evaluations
        @completed_evaluations ||=
          if option.participants.dig('manager', 'can_approves_evaluations')
            threesixty_campaign.
              participants.select('count(id) as completed_evaluations_count, evaluator_id').
              active.
              actual_by_options(option).
              where(evaluator_id: user_ids, manager_evaluation_status: :approved).
              group(:evaluator_id).
              index_by(&:evaluator_id)
          else
            Threesixty::Participants::GetCompletedEvaluations.call!(threesixty_campaign, user_ids)
          end
      end

      def completed_evaluators
        @completed_evaluators ||=
          if option.participants.dig('manager', 'can_approves_evaluations')
            threesixty_campaign.participants.select('count(id) as cache_counter, subject_id').active.actual_by_options(option).
              where(subject_id: user_ids, manager_evaluation_status: :approved).
              group(:subject_id).
              index_by(&:subject_id)
          else
            UsersResult.select('count(id) as cache_counter, subject_id').actual_by_options(option).
              where(subject_id: user_ids, status: :completed).
              group(:subject_id).
              index_by(&:subject_id)
          end
      end
    end
  end
end
