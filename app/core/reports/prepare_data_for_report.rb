# frozen_string_literal: true

module Reports
  class PrepareDataForReport < BaseCommand
    attr_reader :project, :subject, :membership, :report, :locale

    def initialize(args)
      @project    = args[:project]
      @subject    = args[:subject]
      @membership = args[:membership]
      @report     = args[:report]
      @locale     = args[:locale]
    end

    def call
      translations = Translation.to_hash_for_report(report.id, report.assessment_ids, locale)
      available_translations = Translation.available_translation_for_report(report.id, report.assessment_ids)
      broadcast :ok,
                user: Reports::UserSerializer.new(membership).to_json,
                results: serialize_results.to_json,
                data: ReportSerializer.new(report).to_json(include: '**'),
                locales: translations.to_json,
                available_translations: available_translations
    end

    def serialize_results
      lookup_results.group_by { |result| result.object.assessment_id }
    end

    def lookup_results
      if report.category_threesixty?
        participants = Threesixty::EvaluatorParticipants.new(subject).query
        participants_map = participants.index_by(&:evaluator_id)
        # TODO: (atanych): Replace completed status with relevant
        Assign.completed.
          where(evaluator_id: participants.map(&:evaluator_id)).
          includes(:membership, :user).
          map do |assign|
          ::AssignSerializer.new(assign, participants_map: participants_map)
        end
      else
        Assign.
          completed.
          includes(:membership, :user).
          where(
            memberships: { client_id: project.id, user_id: membership.user_id },
            assessment_id: report.assessment_ids
          ).
          references(:membership).
          map { |a| ::AssignSerializer.new(a) }
      end
    end
  end
end
