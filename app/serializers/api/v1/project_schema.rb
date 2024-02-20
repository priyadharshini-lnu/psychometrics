# frozen_string_literal: true

module Api
  module V1
    class ProjectSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:name).filled(:str?)
          required(:subdomain).filled(:str?)
          required(:client_reference).maybe(:str?)
          required(:locales).maybe(:array?).each(:str?)
          required(:enable_strong_password).maybe(:bool?)
          required(:enable_2factor_auth).filled(:bool?)
          required(:background_color).maybe(:str?)
          required(:login_box_position).maybe(:str?)
          required(:created_at).filled(:str?)
          required(:updated_at).filled(:str?)
          required(:project_logo_url).maybe(:str?)
          required(:partner_logo_url).maybe(:str?)
          required(:background_image_url).maybe(:str?)
          required(:data_processing_consent).maybe(:bool?)
          required(:client_id).filled(:int?)
          required(:webhook).maybe(:str?)
        end
      end
    end
  end
end
