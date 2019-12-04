# frozen_string_literal: true

module Exports
  module Assessments
    class ThreesixtyAssessmentResultsExport < BaseAssessmentResultsExport
      def initialize(assessment)
        @assessment = assessment
      end

      def call
        broadcast :ok, get_xlsx_export_result
      end

      private

      def get_result_details_header
        ['Result ID', 'Subject Name', 'Subject Email', 'Evaluator Name', 'Evaluator Email',
         'Relationship', 'Started At', 'Completed At', 'Status']
      end

      def results
        threesixty_participants = BabySqueel[:threesixty_participants]
        UsersResult.joining do
          [
            subject,
            evaluator,
            threesixty_participants.on(
              (threesixty_participants.subject_id == subject_id) &
              (threesixty_participants.evaluator_id == evaluator_id) &
              (threesixty_participants.campaign_id == campaign_id)
            )
          ]
        end.selecting do
          [
            id,
            assessment_id,
            answers.as('results'),
            status,
            created_at.as('started_at'),
            completed_at,
            subject.email.as('subject_email'),
            evaluator.email.as('evaluator_email'),
            subject.last_name.op('||', quoted(', ')).op('||', subject.first_name).as('subject_name'),
            evaluator.last_name.op('||', quoted(', ')).op('||', evaluator.first_name).as('evaluator_name'),
            threesixty_participants.relationship_id.as('relationship_id')
          ]
        end.where(assessment_id: assessment.id)
      end

      def result_details_row_values(users_result)
        [
          UsersResult.encode_id(users_result.id),
          users_result.subject_name,
          users_result.subject_email,
          users_result.evaluator_name,
          users_result.evaluator_email,
          relationship_name_by_id(users_result.relationship_id),
          to_timezone(users_result.started_at),
          to_timezone(users_result.completed_at),
          I18n.t("activerecord.attributes.threesixty.users_result.statuses.#{users_result.status}")
        ]
      end

      def relationship_name_by_id(id)
        campaign_relationships[id]&.name
      end

      def campaign_relationships
        @campaign_relationships ||= Relationships::ByCampaign.new(assessment.campaign).query.index_by(&:id)
      end

      def threesixty_result_export?
        assessment.threesixty?
      end

      def to_timezone(time)
        time&.in_time_zone(Time.zone)&.try(:strftime, '%D %r')
      end
    end
  end
end
