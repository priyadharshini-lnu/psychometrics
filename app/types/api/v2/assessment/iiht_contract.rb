# frozen_string_literal: true

module Api
  module V2
    module Assessment
      class IihtContract < Api::Base::Contract
        rule(data: { attributes: :category }) do
          next unless value

          list = [::Assessment::IIHT]
          key.failure(:included_in?, list: list) unless list.include?(value)
        end

        rule(data: { attributes: { external_settings: :assessment_id } }) do
          next key.failure(:filled?) unless value

          project_id = values.dig(:data, :relationships, :project, :data, :id)
          assessments = Iiht::GetAssessments.call!(::Client.find(project_id))
          key.failure(:not_in_the_list?) unless assessments.find { |a| a['assessmentIdNumber'] == value }
        end

        rule(data: { attributes: { external_settings: :schedule_config } }) do
          key.failure(:json?) if value && !json?(value)
        end

        private

        def json?(data)
          !!JSON.parse(data)
        rescue StandardError
          false
        end
      end
    end
  end
end
