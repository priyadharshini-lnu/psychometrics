# frozen_string_literal: true

module Reports
  class PrepareDataForReport < BaseCommand
    attr_reader :project, :subject, :membership, :report, :locale, :evaluator

    def initialize(args)
      @project    = args[:project]
      @subject    = args[:subject]
      @membership = args[:membership]
      @evaluator  = args[:evaluator]
      @report     = args[:report]
      @locale     = args[:locale]
    end

    def call
      translations = Translation.to_hash_for_report(report.id, report.assessment_ids, locale)
      available_translations = Translation.available_translation_for_report(report.id, report.assessment_ids)
      broadcast :ok,
                user: Reports::UserSerializer.new(evaluator || membership.user).to_json,
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
        participants = Threesixty::EvaluatorParticipantsBySubject.new(subject).query
        participants_map = participants.index_by(&:evaluator_id)
        data_sheet_map = DatasheetRow.
          joins(:datasheet).
          where(datasheets: { project_id: project.id }, email: participants.map { |p| p.evaluator.email }).
          index_by(&:email)

        # TODO: (atanych): Replace completed status with relevant
        Assign.completed.
          where(evaluator_id: participants.map(&:evaluator_id)).
          includes(:evaluator, :assessment).
          map do |assign|
          ::AssignSerializer.new(assign, participants_map: participants_map, data_sheet_map: data_sheet_map)
        end
      else
        Assign.
          completed.
          includes(:membership, :user, :assessment).
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
