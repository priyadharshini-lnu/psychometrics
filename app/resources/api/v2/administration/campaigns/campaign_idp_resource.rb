# frozen_string_literal: true

class Api::V2::Administration::Campaigns::CampaignIdpResource < Api::V2::Administration::BaseResource
  attributes :automatically_assign_new, :override_exists, :dependencies_attributes, :idp_assistant_dependencies

  has_one :idp_template
  has_one :campaign

  def fetchable_fields
    super - %i[override_exists]
  end

  def override_exists=(_); end

  def idp_assistant_dependencies
    @model.idp_template&.one_click_ai_assistant&.dependencies || []
  end

  def dependencies_attributes
    return { questions: [] } unless @model.persisted?

    {
      questions: build_questions_dependencies
    }
  end

  def dependencies_attributes=(value)
    return if value.nil?

    @model.dependencies_attributes = Campaigns::CampaignIdpDependenciesUpdateUtil.call!(
      campaign_idp: @model,
      dependencies_params: value
    )
  end

  def self.records(opts)
    Api::Administration::Campaigns::CampaignIdpPolicy::Scope.new(
      opts[:context][:current_user], CampaignIdp, campaign_id: opts[:context][:campaign].id
    ).resolve
  end

  private

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
end
