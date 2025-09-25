# frozen_string_literal: true

module Api
  class V2::Administration::Campaigns::FactorBenchmarkScoresController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::FactorBenchmarkScore::Schema

    OPERATIONS = {
      add: 'add',
      modify: 'modify',
      delete: 'delete'
    }.with_indifferent_access.freeze

    def index
      assessments = campaign.campaign_assessments.map(&:assessment)
      assessments_id = assessments.pluck(:id)
      dimension_ids = assessments.map(&:dimension_id)

      factors = Factor.where(dimension_id: dimension_ids, skill_id: nil)
      scores = FactorBenchmarkScore.where(campaign_id: campaign.id, assessment_id: assessments_id,
                                          factor_id: factors.pluck(:id))

      jsonapi_render json: scores
    end

    def bulk_create
      # TODO: update to use with common campaigns
      assessment_id = campaign.campaign_assessments.first.assessment_id

      to_add_or_update = params[:data][:attributes].select do |_k, v|
        [OPERATIONS['add'], OPERATIONS['modify']].include?(v['operation'])
      end
      to_remove = params[:data][:attributes].select { |_k, v| v['operation'] == OPERATIONS['delete'] }

      FactorBenchmarkScore.where(campaign_id: campaign.id, assessment_id: assessment_id,
                                 factor_id: to_remove.keys).destroy_all

      to_add_or_update.each do |factor_id, data|
        score = FactorBenchmarkScore.find_or_create_by(
          campaign_id: campaign.id, assessment_id: assessment_id, factor_id: factor_id
        )
        score.update(benchmark_score: data['value'])
      end

      render json: :ok
    end
  end
end
