# frozen_string_literal: true

class UsersResultUpdateSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers

  attributes :expired, :current_block, :translations, :progress_was_reseted, :factors, :next_assessment_url, :scoring,
             :evaluation_session_id
  attribute :scoring, if: -> { @instance_options[:current_user]&.assessor? && object.completed? }

  attribute :next_assessment_url, if: -> { object.completed? }

  has_many :factors, method: :factors

  def evaluation_session_id
    object.user_assessment.evaluation_session_id
  end

  def next_assessment_url
    next_assessment = UserAssessments::GetNext.call!(object.user_assessment)
    user_assessment_path(next_assessment) if next_assessment
  end

  def factors
    return unless @instance_options[:current_user]&.assessor? && object.completed?

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
    block = Block.find_by(id: @instance_options[:current_block_id])
    block ? BlockSerializer.new(block, piped_text_context: piped_text_context) : nil
  end

  def translations
    Assessments::GetTranslationWithPipetextReplaced.call!(
      object.assessment,
      piped_text_context: piped_text_context,
      locale: object.user_assessment.selected_locale || @instance_options[:locale]
    )
  end

  def progress_was_reseted
    @instance_options[:progress_was_reseted]
  end

  def piped_text_context
    {
      evaluator: object.evaluator,
      subject: object.subject,
      threesixty_campaign: @instance_options[:threesixty_campaign],
      campaign: @instance_options[:campaign],
      result: object
    }
  end
end
