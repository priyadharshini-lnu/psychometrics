# frozen_string_literal: true

class IdpTemplateSerializer < Panko::Serializer
  attributes :name, :description, :self_rating_enabled,
             :technical_client_skill_settings, :technical_global_skill_settings,
             :behavioral_client_skill_settings, :behavioral_global_skill_settings,
             :behavioural_global_tags, :behavioural_client_tags,
             :technical_global_tags, :technical_client_tags,
             :logo_type, :title_text, :subtitle_text, :fields,
             :background, :client_logo, :show_reflections,
             :guideline_position, :flip_background, :page_styles, :show_guidelines

  def background
    object.background_url
  end

  def client_logo
    object.client_logo_url
  end
end
