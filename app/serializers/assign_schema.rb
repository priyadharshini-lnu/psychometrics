# frozen_string_literal: true

# rubocop:disable Metrics/AbcSize
# rubocop:disable Metrics/BlockLength

class AssignSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = false

      required(:id).filled(:int?)
      required(:status).maybe(:str?)
      required(:step).maybe(:int?)
      required(:results).maybe(:hash?)
      required(:embedded_data).maybe(:hash?)
      required(:scoring).maybe(:hash?)
      required(:user_id).maybe(:int?)
      required(:hris).maybe(:hash?)
      required(:hash_id).filled(:str?)
      required(:norm_data).maybe(:hash?)
      required(:assessment_id).maybe(:int?)
      required(:external_scoring).filled(:hash?)
      required(:data_sheet).maybe(:hash?)
      required(:relationship).maybe(:hash?)
      required(:available_translations).filled(:array?)
      required(:selected_locale).filled(:hash?)
      required(:translations).filled(:hash?)
      required(:type).maybe(:str?)
      required(:occupations).maybe(:array?)
      required(:innovation_styles).maybe(:array?)
      required(:meta_data).maybe(:hash?)
      required(:current_element).maybe(:hash?)
      required(:current_page).maybe(:hash?)
      required(:seedrandom).maybe(:hash?)
      required(:reset_count).maybe(:int?)
      required(:highlights).maybe(:array?)
      required(:subject_datasheet).maybe(:hash?)
      required(:prev_pages).maybe(:array?)
      required(:remaining_assessment_time).maybe(:hash?)
      required(:report_data).maybe(:array?)
    end
  end
end

# rubocop:enable Metrics/AbcSize
# rubocop:enable Metrics/BlockLength
