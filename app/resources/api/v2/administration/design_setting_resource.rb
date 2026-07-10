# frozen_string_literal: true

class Api::V2::Administration::DesignSettingResource < Api::V2::Administration::BaseResource
  attributes :logo, :secondary_logo, :background, :background_color, :login_box_position,
             :primary_color, :error_color, :warning_color, :success_color, :info_color,
             :background_size, :background_overlay, :logo_alt_text, :secondary_logo_alt_text

  has_one :project, class_name: 'Project'
  has_one :client

  ransack_filters %i[project_id_eq client_id_eq]

  audit_log_for :update, payload: '*'

  def logo
    @model.logo&.url
  end

  def background
    @model.background&.url
  end

  def background_overlay
    @model.background_overlay&.url
  end

  def secondary_logo
    @model.secondary_logo&.url
  end
end
