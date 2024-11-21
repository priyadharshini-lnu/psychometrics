# frozen_string_literal: true

class AssessmentSerializer < Panko::Serializer
  include CachingSerializer

  attributes :id, :name, :category, :disabled, :created_at, :flow, :norm_rules, :factors, :dimension_id,
             :enable_back, :enable_progress, :data_sheet_columns, :relationships, :blocks, :timer_duration,
             :resources_content, :resources_translations, :instructions, :fixed_timed, :options, :default_norm_id,
             :extra, :linked_questions, :allow_multiple_responses, :default_language, :campaign_factors_list

  cache_serializer except: %i[relationships data_sheet_columns allow_multiple_responses],
                   cache_key: lambda { |object|
                     object.serializer_cache_key
                   }

  def blocks
    blocks = object.blocks.selecting do
      ['blocks.*',
       coalesce(template.props, props).as('props'),
       coalesce(template.name, name).as('name')]
    end.joining { template.outer }.
             includes(:questions_ams).where.has { (template.disabled == false) | (template.id == nil) }
    I18n.with_locale(context[:selected_locale]) do
      Panko::ArraySerializer.new(
        blocks,
        each_serializer: BlockSerializer,
        context: {
          piped_text_context: piped_text_context,
          selected_locale: context[:selected_locale]
        }
      ).to_a
    end
  end

  def factors
    return [] unless object.dimension

    Panko::ArraySerializer.new(
      object.dimension.all_factors.with_attached_icon.includes(:sub_factors, :translations),
      each_serializer: Factors::WithSubFactorsSerializer,
      context: {
        assessment_id: object.id
      }
    ).to_a
  end

  def resources_content
    ids = object.resources&.map { |r| r['questionId'] }
    return [] unless ids

    # Brakmen:ignore
    questions = Question.where(id: ids).order(Arel.sql("position(id::text in '#{ids.join(',')}')"))
    Panko::ArraySerializer.new(
      questions,
      each_serializer: QuestionSerializer,
      context: {
        piped_text_context: piped_text_context
      }
    ).to_a
  end

  def resources_translations
    ids = object.resources&.map { |r| r['questionId'] }
    return {} unless ids

    Translation.to_hash_for_questions(ids, context[:selected_locale])
  end

  def data_sheet_columns
    return object.data_sheet_columns if object.data_sheet_columns.present?
    return [] if !object.threesixty? || connected_campaign.nil?

    connected_campaign.datasheet_columns
  end

  def fixed_timed
    object.fixed_timed?
  end

  def relationships
    return [] unless object.threesixty?

    relationships = Relationships::ByCampaign.new(connected_campaign)
    Panko::ArraySerializer.new(
      relationships,
      each_serializer: RelationshipSerializer
    )
  end

  def connected_campaign
    Campaign.joins(:threesixty_campaign).find_by(threesixty_campaigns: { assessment_id: object.id })
  end

  def timer_duration
    object.extra['timer']
  end

  def allow_multiple_responses
    campaign_assessment&.allow_multiple_responses
  end

  private

  def campaign_assessment
    context[:campaign_assessment]
  end

  def piped_text_context
    context[:piped_text_context] || {}
  end
end
