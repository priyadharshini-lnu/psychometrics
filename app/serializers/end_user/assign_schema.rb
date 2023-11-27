# frozen_string_literal: true

# rubocop:disable Metrics/AbcSize
# rubocop:disable Metrics/BlockLength
module EndUser
  class AssignSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:status).filled(:str?)
        required(:step).filled(:int?)
        required(:type).filled(:str?)
        required(:completion_percent) { int? | float? }
        required(:url).filled
        required(:assigned_reports).filled(:hash?)
        required(:assessment_name).filled(:str?)
        required(:questions_count).filled(:int?)
        required(:timing).filled(:str?)
        required(:mindmill).filled(:bool?)
        required(:hogan).filled(:bool?)
        required(:assessment_category).filled(:str?)
        required(:current_element).filled(:str?)
        required(:current_page).filled(:int?)
        required(:seedrandom).filled(:str?)
        optional(:extra).maybe do
          hash do
            optional(:timer).maybe(:str?)
            optional(:icon_color).maybe(:str?)
            optional(:enable_video_check).maybe(:bool?)
            optional(:enable_audio_check).maybe(:bool?)
            optional(:enable_network_check).maybe(:bool?)
          end
        end
        required(:assessment_id).filled(:int?)
        required(:prev_pages).filled(:hash?)
      end
    end
  end
end
# rubocop:enable Metrics/AbcSize
# rubocop:enable Metrics/BlockLength
