# frozen_string_literal: true

class AssessmentSerializer < Panko::Serializer
  attributes :id, :name, :category, :disabled, :created_at, :flow, :norm_rules, :factors, :dimension_id,
             :enable_back, :enable_progress, :data_sheet_columns, :relationships, :blocks, :timer_duration,
             :resources_content, :resources_translations, :instructions, :fixed_timed, :options, :default_norm_id,
             :extra, :linked_questions, :allow_multiple_responses, :default_language, :campaign_factors_list,
             :campaign_id

  def blocks
    template_table = Block.arel_table.alias('templates_blocks')
    blocks_table = Block.arel_table

    coalesce_props = Arel::Nodes::NamedFunction.new('COALESCE',
                                                    [template_table[:props], blocks_table[:props]]).as('props')
    coalesce_name = Arel::Nodes::NamedFunction.new('COALESCE', [template_table[:name], blocks_table[:name]]).as('name')

    template_not_disabled = template_table[:disabled].eq(false)
    template_not_present = template_table[:id].eq(nil)

    blocks = object.blocks.
             left_outer_joins(:template).
             select('blocks.*', coalesce_props, coalesce_name).
             includes(:questions_ams).
             where(template_not_disabled.or(template_not_present))

    I18n.with_locale(context[:selected_locale]) do
      Panko::ArraySerializer.new(
        blocks,
        each_serializer: BlockSerializer,
        context: {
          piped_text_context: piped_text_context,
          selected_locale: context[:selected_locale],
          translations: translations,
          campaign_user: context[:campaign_user] || {},
          ignore_pipetext_substitution: ignore_pipetext_substitution?
        }
      ).to_a
    end
  end

  def instructions
    return object.instructions if default_language?

    return object.instructions unless object.translations_migrated?

    instructions = object.instructions
    translated_content = translations.dig('instructions', 0, 'props', 'content')
    instructions['content'] = translated_content if translated_content

    instructions
  end

  def factors
    return [] unless object.dimension

    factors_data = build_factors_data

    Panko::ArraySerializer.new(
      factors_data[:factors],
      each_serializer: Factors::WithSubFactorsSerializer,
      context: { question_ids: factors_data[:question_ids] }
    ).to_a
  end

  def resources_content
    ids = object.resources&.pluck('questionId')
    return [] unless ids

    questions = Question.where(id: ids).order(
      Arel.sql(
        "array_position(ARRAY[#{ids.join(',')}]::bigint[], id)"
      )
    )
    Panko::ArraySerializer.new(
      questions,
      each_serializer: QuestionSerializer,
      context: {
        piped_text_context: piped_text_context,
        selected_locale: context[:selected_locale],
        translations: translations,
        ignore_pipetext_substitution: ignore_pipetext_substitution?
      }
    ).to_a
  end

  def resources_translations
    ids = object.resources&.pluck('questionId')
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

  def extra
    return object.extra if object.extra['enable_audio_check'] && object.extra['enable_video_check']

    audio_and_video_check_data = {
      enable_audio_check: object.extra['enable_audio_check'] || has_question_type('AudioResponse'),
      enable_video_check: object.extra['enable_video_check'] || has_question_type('VideoResponse')
    }

    object.extra.merge(audio_and_video_check_data)
  end

  private

  def build_factors_data
    if object.skill_rater?
      build_skill_rater_factors_data
    else
      build_standard_factors_data
    end
  end

  def build_skill_rater_factors_data
    filter = CampaignUsers::GetApplicableSkillIds::FilterBuilder.
             build_filter_from_skill_rater_blocks(skill_rater_blocks)
    skill_ids = CampaignUsers::GetApplicableSkillIds.call!(
      context[:campaign_user],
      filter: filter
    )

    skill_question_ids = Question.where(skill_id: skill_ids).pluck(:id)
    skill_factors = object.dimension.factors.where(skill_id: skill_ids)

    base_factors = non_skill_factors
    base_question_ids = factor_question_ids

    combined_factors = combine_factors(base_factors, skill_factors)
    combined_question_ids = combine_question_ids(base_question_ids, skill_question_ids)

    { factors: combined_factors, question_ids: combined_question_ids }
  end

  def build_standard_factors_data
    { factors: non_skill_factors, question_ids: factor_question_ids }
  end

  def combine_factors(base_factors, skill_factors)
    return base_factors if skill_factors.blank?

    (Array(base_factors) + Array(skill_factors)).uniq
  end

  def combine_question_ids(base_question_ids, skill_question_ids)
    return base_question_ids if skill_question_ids.blank?

    (Array(base_question_ids) + Array(skill_question_ids)).uniq
  end

  def non_skill_factors
    object.dimension.non_skill_factors.
      with_attached_icon.
      includes(:sub_factors, :translations, sub_factors: :translations)
  end

  def factor_question_ids
    FactorsScoring.factor_question_ids(object.id)
  end

  def skill_rater_blocks
    object.blocks.skill_rater
  end

  def campaign_assessment
    context[:campaign_assessment]
  end

  def piped_text_context
    context[:piped_text_context] || {}
  end

  def campaign_id
    context[:campaign_id] || nil
  end

  def has_question_type(type)
    available_questions = object.questions.not_deleted.uniq { |q| q[:type] }

    available_questions.any? { |q| q[:type] == type }
  end

  def default_language?
    default_language == context[:selected_locale]
  end

  def translations
    Assessments::GetTranslationWithPipetextReplaced.call!(
      object,
      piped_text_context: piped_text_context,
      locale: context[:selected_locale],
      ignore_pipetext_substitution: ignore_pipetext_substitution?
    )
  end

  def ignore_pipetext_substitution?
    context[:ignore_pipetext_substitution] || false
  end
end
