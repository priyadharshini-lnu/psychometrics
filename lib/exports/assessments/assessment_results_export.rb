# frozen_string_literal: true

module Exports
  module Assessments
    class AssessmentResultsExport < BaseAssessmentResultsExport
      QUESTIONS = %w[ConstantSum GapAnalysis GraphicSlider HotSpot
                     MatrixTable MetaInfo MultipleChoice PickGroupRank
                     RankOrder SideBySide Slider TextEntry Timing].freeze

      private_attr_accessor :assessment

      def initialize(assessment, client_id, options = {})
        @assessment = assessment
        @client_id = client_id
        @scoring = !!options[:scoring]
        @external = !!options[:external]
      end

      def call
        xlsx = if @external
                 Exports::External::BaseExternalExport.build(Assessment::TYPES.key(@assessment.type)).
                   to_xlsx(results)
               else
                 get_xlsx_export_result
               end

        broadcast :ok, xlsx
      end

      private

      def get_result_details_header
        ['Result ID', 'Name', 'Email', 'Started At', 'Completed At', 'Norm Data', 'Status']
      end

      def result_details_row_values(assign)
        norm_data = export_norm(assign.norm_data)
        [
          assign.encode_id,
          assign.user_name,
          assign.user_email,
          assign.started_at.try(:strftime, '%D %r'),
          assign.completed_at.try(:strftime, '%D %r'),
          norm_data,
          I18n.t("activerecord.attributes.assign.statuses.#{assign.status}")
        ]
      end

      def results
        client = Client.find(@client_id)
        if client.project?
          project_level_assigns
        else
          subproject_level_assigns
        end
      end

      def project_level_assigns
        Queries::Assigns::ProjectLevel::ByClientAndAssessment.call(@client_id, @assessment.id).
          selecting do
          [id,
           results,
           external_results,
           norm_data,
           status,
           completed_at,
           started_at,
           membership.user.last_name.op('||', quoted(', ')).op('||', membership.user.first_name).as('user_name'),
           membership.user.email.as('user_email')]
        end
      end

      def subproject_level_assigns
        Queries::Assigns::SubProjectLevel::ByClientAndAssessment.call(@client_id, @assessment.id).
          selecting do
          [id,
           results,
           external_results,
           norm_data,
           status,
           completed_at,
           started_at,
           original_assign.membership.user.
             last_name.
             op('||', quoted(', ')).
             op('||', original_assign.membership.user.first_name).
             as('user_name'),
           original_assign.membership.user.email.as('user_email')]
        end
      end

      def export_norm(norm_data)
        return if norm_data.nil? || norm_data['id'].nil?

        norm = Norm.find(norm_data['id'])
        "#{norm.name}:#{norm_data['type']}"
      rescue ActiveRecord::RecordNotFound
        Rails.logger.error("Norm #{norm_data['id']} is not found")
      end
    end
  end
end
