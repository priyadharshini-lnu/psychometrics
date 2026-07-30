# frozen_string_literal: true

class Api::V2::Administration::DevelopmentActionResource < Api::V2::Administration::BaseResource
  attributes :name, :description, :development_action_type, :course_url, :course_start_date, :course_end_date,
             :project_id, :learning_style, :image, :skill_ids, :created_at, :updated_at, :global,
             :available_languages, :duration, :tag_list

  has_one :project
  has_many :skills

  ransack_filters %i[
    name_cont
    project_id_eq
    global
    filterable_fields
  ]

  def meta_details
    {
      permissions: lambda {
        GetPermissionsHash.call!(
          Api::Administration::DevelopmentActionPolicy,
          context[:user],
          @model,
          [
            %w[edit update]
          ],
          {
            project_id: context[:project_id]
          }
        )
      }
    }
  end

  def created_at
    @model.decorate.created_at
  end

  def updated_at
    @model.decorate.updated_at
  end

  def global
    @model.project_id.nil?
  end

  def global=(value)
    @model.project_id = nil if value
  end

  delegate :skill_ids=, to: :@model
  delegate :tag_list=, to: :@model

  def image
    @model.image_url
  end

  def self.records(opts = {})
    super.with_attached_image.includes(
      :translations,
      taggings: :tag,
      skills: [:translations],
      owner: [:creator, :modifier, { design_setting: :logo_attachment }]
    )
  end

  def course_url
    @model.course_url.presence
  end

  def course_url=(url)
    @model.course_url = url.presence
  end

  def course_start_date=(date)
    return if date.blank?

    @model.course_start_date = if date.is_a?(ActionController::Parameters) && date['$d'].present?
                                 Time.zone.parse(date['$d'])
                               else
                                 Time.zone.parse(date.to_s)
                               end
  end

  def course_end_date=(date)
    return if date.blank?

    @model.course_end_date = if date.is_a?(ActionController::Parameters) && date['$d'].present?
                               Time.zone.parse(date['$d'])
                             else
                               Time.zone.parse(date.to_s)
                             end
  end

  def self.sortable_fields(context)
    super + %i[project.name]
  end

  def course_start_date
    @model.course_start_date&.strftime('%Y-%m-%d')
  end

  def course_end_date
    @model.course_end_date&.strftime('%Y-%m-%d')
  end
end
