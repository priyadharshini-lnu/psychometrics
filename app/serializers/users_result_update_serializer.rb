# frozen_string_literal: true

class UsersResultUpdateSerializer < Panko::Serializer
  include Rails.application.routes.url_helpers

  attributes :expired, :progress_was_reseted, :factors, :next_assessment_url, :scoring,
             :evaluation_session_id, :piped_text_mapping

  def scoring
    return unless context[:current_user]&.assessor? && object.completed?

    object.scoring
  end

  def evaluation_session_id
    object.user_assessment.evaluation_session_id
  end

  def next_assessment_url
    return unless object.completed?

    next_assessment = UserAssessments::GetNext.call!(object.user_assessment)
    user_assessment_path(next_assessment) if next_assessment
  end

  def factors
    return unless context[:current_user]&.assessor? && object.completed?

    factors = Factor.where(id: object.scoring&.keys)
    Panko::ArraySerializer.new(
      factors,
      each_serializer: UsersResults::FactorSerializer
    ).to_a
  end

  def piped_text_mapping
    fetched_piped_text
  end

  def expired
    object.user_assessment.expired?
  end

  def progress_was_reseted
    context[:progress_was_reseted]
  end

  def fetched_piped_text
    assessment = object.user_assessment&.assessment
    assessment&.generate_piped_text_mapping(piped_text_context)
  end

  def piped_text_context
    {
      evaluator: object.evaluator,
      subject: object.subject,
      threesixty_campaign: context[:threesixty_campaign],
      campaign: context[:campaign],
      result: object,
      assessment: object.assessment
    }
  end

  def missing_piped_text
    context[:missing_piped_text] || []
  end
end
