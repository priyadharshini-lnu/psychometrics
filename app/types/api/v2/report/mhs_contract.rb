# frozen_string_literal: true

module Api
  module V2
    module Report
      class MhsContract < Api::Base::Contract
        rule(data: { attributes: { external_settings: :report_id } }) do
          next key.failure(:filled?) unless value

          assessment_ids = values.dig(:data, :relationships, :assessments, :data).pluck(:id)
          mhs_assessment_ids = ::Assessment.where(id: assessment_ids,
                                                  type: ::Assessment::TYPES[:mhs]).map do |a|
            a.external_settings['assessment_id']
          end.uniq

          assessment = Settings.providers.mhs.assessments.find do |a|
            mhs_assessment_ids.include?(a[:id].downcase)
          end

          key.failure(:not_in_the_list?) if !assessment || assessment[:report_ids].exclude?(value.downcase)
        end
      end
    end
  end
end
