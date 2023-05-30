# frozen_string_literal: true

class UsersResultUpdateSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers
  attributes :expired, :current_block, :translations, :progress_was_reseted
  attribute :scoring, if: -> { @instance_options[:current_user]&.assessor? && object.completed? }

  attribute :next_assessment_url, if: -> { object.completed? }

  has_many :factors, serializer: UsersResults::FactorSerializer, if: lambda {
    @instance_options[:current_user]&.assessor? && object.completed?
  }

  def next_assessment_url
    next_assessment = UserAssessments::GetNext.call!(object.user_assessment)
    user_assessment_path(next_assessment) if next_assessment
  end

  def factors
    Factor.where(id: object.scoring&.keys)
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
