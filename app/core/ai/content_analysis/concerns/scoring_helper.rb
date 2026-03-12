# frozen_string_literal: true

module AI
  module ContentAnalysis
    module Concerns
      module ScoringHelper
        extend ActiveSupport::Concern

        private

        # Recursively find all ancestor factors in the hierarchy
        def determine_all_ancestors(child_ids)
          child_ids = Array.wrap(child_ids).map(&:to_i)

          all_relationships = FactorsSubFactor.
                              where(sub_factor_id: child_ids).
                              pluck(:sub_factor_id, :factor_id)

          parent_map = all_relationships.each_with_object(Hash.new { |h, k| h[k] = [] }) do |(child, parent), map|
            map[child] << parent
          end

          all_factor_ids = Set.new
          queue = child_ids.dup

          while queue.any?
            current_id = queue.shift
            parents = parent_map[current_id] || []

            parents.each do |parent_id|
              next if all_factor_ids.include?(parent_id)

              all_factor_ids.add(parent_id)
              queue << parent_id

              next if parent_map.key?(parent_id)

              parent_relationships = FactorsSubFactor.
                                     where(sub_factor_id: parent_id).
                                     pluck(:sub_factor_id, :factor_id)

              parent_relationships.each do |(child, parent)|
                parent_map[child] ||= []
                parent_map[child] << parent
              end
            end
          end

          all_factor_ids.to_a
        end

        def determine_all_children(parent_ids)
          return [] if parent_ids.blank?

          FactorsSubFactor.
            where(factor_id: parent_ids).
            pluck(:sub_factor_id).
            uniq
        end

        def calculate_extended_scoring(scoring_map, factor_ids_scope)
          ::UsersResults::Scoring::Extend.call!(
            dimension: users_result.assessment.dimension,
            scoring: scoring_map,
            norm_data: users_result.norm_data,
            answers: users_result.answers,
            factors_scope: Factor.where(id: factor_ids_scope)
          )
        end

        def upsert_factor_score(attrs)
          record = AI::FactorScore.find_or_initialize_by(
            users_result: users_result,
            factor_id: attrs[:factor_id],
            question_id: attrs[:question_id]
          )

          record.assign_attributes(
            score: attrs[:score],
            confidence: attrs[:confidence],
            citations: attrs[:citations],
            rationale: attrs[:rationale],
            parent_factor_id: attrs[:parent_factor_id],
            scoring_type: attrs[:scoring_type],
            status: attrs[:status] || initial_status
          )

          record.save!
          record
        end

        def initial_status
          user_assessment.has_ai_scoring_approval_flow? ? :pending : :auto_approved
        end
      end
    end
  end
end
