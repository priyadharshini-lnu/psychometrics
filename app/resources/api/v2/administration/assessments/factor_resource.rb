# frozen_string_literal: true

class Api::V2::Administration::Assessments::FactorResource < Api::V2::Administration::BaseResource
  attributes :name, :scoring_strategy, :parent

  has_many :sub_factors
  has_many :parent_factors

  ransack_filters %i[filterable_fields search_query]

  def parent
    %w[sub_factor_questions
       sub_factors_average
       sub_factors_conditional_average
       sub_factor_questions_sum
       external_score
       sub_factors_sum].include?(@model.scoring_strategy)
  end

  def self.records(opts)
    if opts[:context][:user].is?(:superadmin)
      Assessment.find(opts[:context][:params][:assessment_id]).dimension.all_factors
    else
      user_clients_ids = opts[:context][:user].accessible_client_ids
      campaign_template_assessment_ids = CampaignTemplate.where(
        owner_id: [nil, user_clients_ids]
      ).pluck(:assessment_id)

      ::Assessment.where(owner_id: user_clients_ids).or(
        Assessment.where(id: campaign_template_assessment_ids)
      ).find_by(
        owner: [nil, opts[:context][:project].client.id],
        id: opts[:context][:params][:assessment_id]
      )&.dimension&.all_factors || Factor.none
    end
  end
end
