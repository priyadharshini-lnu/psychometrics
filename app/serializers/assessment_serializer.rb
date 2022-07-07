# frozen_string_literal: true

# == Schema Information
#
# Table name: assessments
#
#  id                :integer          not null, primary key
#  name              :string
#  category          :enum             default("psychometric")
#  dimension_id      :integer
#  disabled          :boolean          default(FALSE)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  flow              :json
#  norm_rules        :json
#  description       :text
#  timing            :string
#  access_reports_at :datetime
#  status            :integer
#

class AssessmentSerializer < ActiveModel::Serializer
  attributes :id, :name, :category, :disabled, :created_at, :flow, :norm_rules, :factors, :dimension_id,
             :enable_back, :enable_progress, :data_sheet_columns, :relationships, :blocks, :timer_duration,
             :resources_content, :resources_translations, :instructions, :fixed_timed, :options, :default_norm_id

  def blocks
    object.blocks.
      selecting do
      ['blocks.*',
       coalesce(template.props, props).as('props'),
       coalesce(template.name, name).as('name')]
    end.
      joining { template.outer }.
      includes(questions_ams: :comments).
      where.has { (template.disabled == false) | (template.id == nil) }.map do |block|
      BlockSerializer.new(block, piped_text_context: piped_text_context)
    end
  end

  def factors
    return [] unless object.dimension

    object.dimension.all_factors.includes(:sub_factors).
      map { |factor| Factors::WithSubFactorsSerializer.new(factor).to_hash }
  end

  def resources_content
    ids = object.resources&.map { |r| r['questionId'] }
    return [] unless ids

    questions = Question.where(id: ids).order("position(id::text in '#{ids.join(',')}')")
    questions.map { |q| QuestionSerializer.new(q, piped_text_context: piped_text_context) }
  end

  def resources_translations
    ids = object.resources&.map { |r| r['questionId'] }
    return {} unless ids

    Translation.to_hash_for_questions(ids, @instance_options[:selected_locale])
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

    Relationships::ByCampaign.new(connected_campaign).map { |r| RelationshipSerializer.new(r).to_h }
  end

  def connected_campaign
    @connected_campaign ||= Campaign.joins(:threesixty_campaign).
                            find_by(threesixty_campaigns: { assessment_id: object.id })
  end

  def timer_duration
    object.extra['timer']
  end

  private

  def piped_text_context
    instance_options[:piped_text_context] || {}
  end
end
