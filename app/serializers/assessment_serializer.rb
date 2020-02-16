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
             :enable_back, :enable_progress, :data_sheet_columns, :relationships, :blocks

  def blocks
    object.blocks.
      selecting do
      ['blocks.*',
       coalesce(template.props, props).as('props'),
       coalesce(template.name, name).as('name')]
    end .
      joining { template.outer }.
      includes(questions_ams: :comments).
      where.has { (template.disabled == false) | (template.id == nil) }.map do |block|
      BlockSerializer.new(block, piped_text_context: @instance_options[:piped_text_context])
    end
  end

  def factors
    return [] unless object.dimension

    object.dimension.all_factors.includes(:sub_factors).
      map { |factor| Factors::WithSubFactorsSerializer.new(factor).to_hash }
  end

  def data_sheet_columns
    return [] if !object.threesixty? || connected_campaign.nil?

    Datasheet.find_by(project_id: connected_campaign.project_id)&.normalize_columns || []
  end

  def relationships
    return [] unless object.threesixty?

    Relationships::ByCampaign.new(connected_campaign).map { |r| RelationshipSerializer.new(r).to_h }
  end

  def connected_campaign
    @connected_campaign ||= Campaign.joins(:threesixty_campaign).
                            find_by(threesixty_campaigns: { assessment_id: object.id })
  end
end
