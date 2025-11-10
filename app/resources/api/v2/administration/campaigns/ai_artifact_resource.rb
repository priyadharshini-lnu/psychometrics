# frozen_string_literal: true

class Api::V2::Administration::Campaigns::AIArtifactResource < Api::V2::Administration::BaseResource
  model_name 'AI::CampaignArtifact'

  attributes :name,
             :code, :instructions, :include_all_datasheet_columns, :dependencies_attributes

  has_one :ai_assistant
  has_one :campaign

  ransack_filters %i[filterable_fields]

  def self.records(opts)
    Api::Administration::Campaigns::AIArtifactPolicy::Scope.new(
      opts[:context][:current_user], AI::CampaignArtifact, campaign_id: opts[:context][:campaign].id
    ).resolve
  end

  def dependencies_attributes
    return { campaign_factors: [], questions: [], sheet_columns: [] } unless @model.persisted?

    {
      campaign_factors: build_campaign_factors_dependencies,
      questions: build_questions_dependencies,
      sheet_columns: build_sheet_columns_dependencies
    }
  end

  def dependencies_attributes=(value)
    return if value.nil?

    @model.dependencies_attributes = Campaigns::AIArtifactDependenciesUpdateUtil.call!(
      ai_artifact: @model,
      dependencies_params: value
    )
  end

  private

  def build_campaign_factors_dependencies
    @model.campaign_factors.map do |factor|
      {
        id: factor.id,
        name: factor.name,
        code: factor.code
      }
    end
  end

  def build_questions_dependencies
    @model.questions.includes(:assessment).map do |question|
      {
        id: question.id.to_s,
        question_text: question.props&.dig('questionText'),
        name: question.name,
        assessment_id: question.assessment.id.to_s,
        assessment_name: question.assessment.name
      }
    end
  end

  def build_sheet_columns_dependencies
    @model.sheet_columns.map do |column|
      {
        id: column.id,
        name: column.name
      }
    end
  end
end
