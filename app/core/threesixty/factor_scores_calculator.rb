# frozen_string_literal: true

module Threesixty
  class FactorScoresCalculator < BaseCommand
    private_attr_reader :campaign, :user, :factor_benchmarks

    def initialize(user, campaign)
      @campaign = campaign
      @user = user
      @factor_benchmarks = {}
      load_factor_benchmarks
    end

    def call
      results = generate_factor_scores
      broadcast :ok, results: results
    end

    private

    def generate_factor_scores
      factors.map do |factor|
        {
          competency: factor.name,
          description: factor.description,
          scores: calculate_relationship_scores(factor)
        }
      end
    end

    def calculate_relationship_scores(factor)
      relationship_scores = group_scores_by_relationship(factor)

      self_score = calculate_average_score(relationship_scores['Self'] || [])

      available_relationships.map do |relationship|
        scores = relationship_scores[relationship] || []
        relationship_score = calculate_average_score(scores)

        build_score_object(
          relationship: relationship,
          score: relationship_score,
          self_score: self_score,
          benchmark: factor_benchmarks[factor.id]
        )
      end
    end

    def group_scores_by_relationship(factor)
      user_assessments.each_with_object(Hash.new { |h, k| h[k] = [] }) do |assessment, scores|
        result = assessment.users_result
        next unless result&.scoring&.dig(factor.id.to_s, 'score')

        relationship_name = assessment.relationship.name
        scores[relationship_name] << result.scoring[factor.id.to_s]['score']

        # "Others" score is average of all evaluation score excluding self score
        if relationship_name != 'Self'
          scores['Others'] << result.scoring[factor.id.to_s]['score']
        end
      end
    end

    def build_score_object(relationship:, score:, self_score:, benchmark:)
      {
        relationship: relationship,
        score: score,
        gap: calculate_gap(self_score, score),
        benchmark: benchmark&.to_f,
        benchmark_gap: benchmark && score ? (benchmark.to_f - score).round(2) : nil
      }
    end

    def calculate_average_score(scores)
      return nil if scores.empty?

      (scores.sum / scores.size.to_f).round(2)
    end

    def calculate_gap(self_score, relationship_score)
      return nil if self_score.nil? || relationship_score.nil?

      (self_score - relationship_score).round(2)
    end

    def user_assessments
      @user_assessments ||= UserAssessment.
                            includes(:users_result, :relationship).
                            joins(:relationship).
                            where(campaign_id: campaign.id, subject: user, status: :completed).
                            where('relationships.campaign_id = ? OR relationships.campaign_id IS NULL', campaign.id)
    end

    def factors
      @factors ||= campaign.threesixty_campaign.assessment.dimension.all_factors
    end

    def available_relationships
      @available_relationships ||= campaign.threesixty_campaign.available_relationships.
                                   pluck(:name) + ['Others']
    end

    def load_factor_benchmarks
      FactorBenchmarkScore.where(factor_id: factors.pluck(:id)).find_each do |benchmark|
        @factor_benchmarks[benchmark.factor_id] = benchmark.benchmark_score
      end
    end
  end
end
