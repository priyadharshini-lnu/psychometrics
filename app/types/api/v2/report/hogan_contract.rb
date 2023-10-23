# frozen_string_literal: true

module Api
  module V2
    module Report
      class HoganContract < Api::Base::Contract
        rule(data: { attributes: { external_settings: :report_id } }) do
          next key.failure(:filled?) unless value

          assessment_ids = values.dig(:data, :relationships, :assessments, :data).pluck(:id)
          hogan_assessment_ids = ::Assessment.where(id: assessment_ids,
                                                    type: ::Assessment::TYPES[:hogan]).map do |assessment|
            assessment.external_settings['assessment_id']
          end.uniq

          report = Settings.providers.hogan.reports.find { |r| r[:id] == value }
          key.failure(:not_in_the_list?) if !report || report[:assessment_ids].to_set != hogan_assessment_ids.to_set
        end
      end
    end
  end
end
