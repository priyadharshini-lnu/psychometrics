# frozen_string_literal: true

module Reports
  class ResultSerializer < Panko::Serializer
    attributes :id, :status, :answers, :results, :scoring, :user_id, :assessment_id, :data_sheet, :relationship,
               :norm_id, :embedded_data, :manager_evaluation_status, :subject_datasheet, :external_scoring,
               :occupations, :innovation_styles, :user, :media_responses, :campaign_factor_results

    def status
      object.real_status
    end

    def results
      object.answers
    end

    def occupations
      (object.occupations || []).map do |item|
        {
          id: item['id'],
          value: item['value'],
          stars: Occupations::CalculateStars.call!(item['value'])
        }
      end
    end

    def innovation_styles
      (object.innovation_styles || []).map { |item| { id: item['id'], value: item['value'] } }
    end

    def user
      UserSerializer.new(context: { campaign: campaign }).serialize(object.evaluator)
    end

    def user_id
      object.evaluator_id
    end

    def manager_evaluation_status
      object.user_assessment&.manager_evaluation_status
    end

    def relationship
      object.user_assessment&.relationship&.name
    end

    def data_sheet
      campaign&.datasheet_data(object.evaluator.email)
    end

    def subject_datasheet
      campaign&.datasheet_data(object.subject.email)
    end

    def external_scoring
      return object.external_results if object.assessment.mindmill?
      return object.external_results['scores'] || [] if object.assessment.saville?

      if object.assessment.hogan?
        score = object.external_results
        if score.present?
          raw_scale = score.dig('scores', 'rawScores', 'scaleScores') || []
          percentile_scale = score.dig('scores', 'percentileScores', 'scaleScores') || []
          percentile_subscale = score.dig('scores', 'percentileScores', 'subscaleScores') || []
          return {
            'RawScale' => normalize_hogan(raw_scale),
            'PercentileScale' => normalize_hogan(percentile_scale),
            'PercentileSubscale' => normalize_hogan(percentile_subscale)
          }
        end
      end
      {}
    end

    def campaign_factor_results
      object.campaign.campaign_factor_values.where(
        user_id: object.user_id, campaign_factors: { public_visibility: true }
      ).includes(:campaign_factor).map do |cfv|
        {
          code: cfv.campaign_factor.code,
          value: cfv.value,
          name: cfv.campaign_factor.name,
          description: cfv.campaign_factor.description
        }
      end
    end

    def media_responses
      Panko::ArraySerializer.new(
        object.media_responses.order(:created_at),
        each_serializer: MediaResponseSerializer
      ).to_a
    end

    private

    def campaign
      context[:campaign]
    end

    def normalize_hogan(items)
      items.each_with_object({}) do |v, res|
        res[v['id'].to_s.rjust(2, '0')] = (v['scaleScore'] || v['subscaleScore']).to_f
      end
    end
  end
end
