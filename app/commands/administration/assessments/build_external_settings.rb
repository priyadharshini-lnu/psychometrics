# frozen_string_literal: true

module Administration
  module Assessments
    class BuildExternalSettings < BaseCommand
      private_attr_reader :assessment, :raw_external_settings

      def initialize(assessment, raw_external_settings)
        @assessment = assessment
        @raw_external_settings = raw_external_settings
      end

      def call
        case assessment.type
          when Assessment::TYPES[:hogan]
            broadcast(:ok, build_hogan)
          when Assessment::TYPES[:pearson]
            broadcast(:ok, build_pearson)
          when Assessment::TYPES[:iiht]
            broadcast(:ok, build_iiht)
          when Assessment::TYPES[:mettl]
            broadcast(:ok, build_mettl)
          when Assessment::TYPES[:saville]
            broadcast(:ok, build_saville)
          when Assessment::TYPES[:common]
            broadcast(:ok, {})
          when Assessment::TYPES[:simulation]
            broadcast(:ok, build_simulation)
          when Assessment::TYPES[:skillvue]
            broadcast(:ok, build_skillvue)
          when Assessment::TYPES[:yoodli]
            broadcast(:ok, build_yoodli)
        end
      end

      private

      def build_hogan
        assessment_id = raw_external_settings[:assessment_id]
        settings = Settings.providers.hogan.assessments.find { |a| a.id == assessment_id&.upcase }
        { form_id: settings.form_id, assessment_id: assessment_id }
      end

      def build_pearson
        assessment_id = raw_external_settings[:assessment_id]
        norm_id = raw_external_settings[:norm_id]
        pearson_assessment = PearsonAssessment.find_by(product_id: assessment_id)
        pearson_norm = pearson_assessment.norms['items'].find { |i| i['normId'] == norm_id }
        language = pearson_norm&.dig('supportedLanguage')
        { norm_id: norm_id, assessment_id: assessment_id, assessment_language: language }
      end

      def build_iiht
        assessment_id = raw_external_settings[:assessment_id]
        schedule_config =
          if raw_external_settings[:schedule_config]
            JSON.parse(raw_external_settings[:schedule_config])
          else
            {}
          end
        { schedule_config: schedule_config, assessment_id: assessment_id }
      end

      def build_saville
        assessment_id = raw_external_settings[:assessment_id]
        settings = Settings.providers.saville.assessments.find { |a| a.id.downcase == assessment_id }
        { norm_id: settings.default_norm_id, assessment_id: assessment_id }
      end

      def build_mettl
        { assessment_id: raw_external_settings[:assessment_id] }
      end

      def build_simulation
        { assessment_id: raw_external_settings[:assessment_id] }
      end

      def build_skillvue
        { assessment_id: raw_external_settings[:assessment_id] }
      end

      def build_yoodli
        { assessment_id: raw_external_settings[:assessment_id] }
      end
    end
  end
end
