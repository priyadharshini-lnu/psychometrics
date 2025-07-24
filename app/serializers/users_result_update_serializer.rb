# frozen_string_literal: true

class UsersResultUpdateSerializer < Panko::Serializer
  include Rails.application.routes.url_helpers

  attributes :expired, :current_block, :translations, :progress_was_reseted, :factors, :next_assessment_url, :scoring,
             :evaluation_session_id

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

  def expired
    object.user_assessment.expired?
  end

  def current_block
    block = Block.find_by(id: context[:current_block_id])
    if block
      BlockSerializer.new(
        context: {
          piped_text_context: piped_text_context,
          selected_locale: object.user_assessment.selected_locale || context[:locale],
          translations: translations,
          campaign_user: context[:campaign_user]
        }
      ).serialize(block)
    end
  end

  def translations
    Assessments::GetTranslationWithPipetextReplaced.call!(
      object.assessment,
      piped_text_context: piped_text_context,
      locale: object.user_assessment.selected_locale || context[:locale]
    )
  end

  def progress_was_reseted
    context[:progress_was_reseted]
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
end
