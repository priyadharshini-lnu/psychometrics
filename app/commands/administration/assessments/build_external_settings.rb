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
        type_to_method = {
          Assessment::TYPES[:hogan] => :build_hogan,
          Assessment::TYPES[:pearson] => :build_pearson,
          Assessment::TYPES[:iiht] => :build_iiht,
          Assessment::TYPES[:mettl] => :build_mettl,
          Assessment::TYPES[:saville] => :build_saville,
          Assessment::TYPES[:common] => nil,
          Assessment::TYPES[:simulation] => :build_simulation,
          Assessment::TYPES[:skillvue] => :build_skillvue,
          Assessment::TYPES[:yoodli] => :build_yoodli,
          Assessment::TYPES[:mhs] => :build_mhs,
          Assessment::TYPES[:microsite] => :build_microsite
        }

        method = type_to_method[assessment.type]
        result = method ? send(method) : {}
        broadcast(:ok, result)
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

      def build_mhs
        { assessment_id: raw_external_settings[:assessment_id] }
      end

      def build_microsite
        assessment_id = raw_external_settings[:assessment_id]
        question_mappings =
          if raw_external_settings[:question_mappings]
            JSON.parse(raw_external_settings[:question_mappings])
          else
            default_question_mappings(assessment_id)
          end
        { assessment_id: assessment_id, question_mappings: question_mappings }.compact
      end

      def default_question_mappings(product_id)
        catalog = MicrositeAssessment.find_by(product_id: product_id)
        return unless catalog&.metadata&.dig('questions')

        catalog.metadata['questions'].keys.index_with { |_| nil }
      end
    end
  end
end
