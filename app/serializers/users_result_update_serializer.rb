# frozen_string_literal: true

class UsersResultUpdateSerializer < ActiveModel::Serializer
  attributes :expired, :current_block, :translations
  attribute :scoring, if: -> { @instance_options[:current_user]&.assessor? && object.completed? }

  has_many :factors, serializer: UsersResults::FactorSerializer, if: lambda {
    @instance_options[:current_user]&.assessor? && object.completed?
  }

  def factors
    Factor.where(id: object.scoring&.keys)
  end

  def expired
    object.expired?
  end

  def current_block
    block = Block.find_by(id: @instance_options[:current_block_id])
    block ? BlockSerializer.new(block, piped_text_context: piped_text_context) : nil
  end

  def translations
    Assessments::GetTranslationWithPipetextReplaced.call!(
      object.assessment,
      piped_text_context: piped_text_context,
      locale: object.selected_locale || @instance_options[:locale]
    )
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
