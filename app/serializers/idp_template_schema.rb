# frozen_string_literal: true

class IdpTemplateSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:name).filled(:str?)
      required(:description).filled(:str?)
      required(:self_rating_enabled).filled(:bool?)
      required(:technical_client_skill_settings).filled(:bool?)
      required(:technical_global_skill_settings).filled(:bool?)
      required(:behavioral_client_skill_settings).filled(:bool?)
      required(:behavioral_global_skill_settings).filled(:bool?)
      required(:behavioural_global_tags).filled(:bool?)
      required(:behavioural_client_tags).filled(:bool?)
      required(:technical_global_tags).filled(:bool?)
      required(:technical_client_tags).filled(:bool?)
      required(:logo_type).filled(:str?)
      required(:title_text).filled(:str?)
      required(:subtitle_text).filled(:str?)
      required(:fields).filled(:str?)
      required(:background).filled(:str?)
      required(:client_logo).filled(:str?)
      required(:show_reflections).filled(:bool?)
    end
  end
end
