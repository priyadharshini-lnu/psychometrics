# frozen_string_literal: true

module Administration
  module Reports
    module ExternalSettings
      class HoganForm < BaseForm
        attribute :report_id,      String
        attribute :norm_id,        String
        attribute :language_id,    String
        attribute :suitability_id, String

        validates :norm_id, :language_id, presence: true, if: :report_id_present?

        private

        def norm_id
          hogan_details&.norm_id
        end

        def language_id
          hogan_details&.language_id
        end

        def suitability_id
          hogan_details&.suitability_id
        end

        def hogan_details
          @hogan_details ||= Settings.providers.hogan.reports.detect { |r| r.id == report_id }
        end

        def report_id_present?
          report_id.present?
        end
      end
    end
  end
end
