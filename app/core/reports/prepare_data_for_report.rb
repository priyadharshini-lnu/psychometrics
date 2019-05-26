# frozen_string_literal: true

module Reports
  class PrepareDataForReport < BaseCommand
    attr_reader :project, :subject, :membership, :user_report, :report, :locale, :evaluator

    def initialize(args)

      @project     = args[:project]
      @membership  = args[:membership]
      @user_report = args[:user_report]
      @report      = args[:report] || @user_report.report
      @locale      = args[:locale]
    end

    def call
      translations = Translation.to_hash_for_report(report.id, report.assessment_ids, locale)
      available_translations = Translation.available_translation_for_report(report.id, report.assessment_ids)
      broadcast :ok,
                user: Reports::UserSerializer.new(user_report&.user || membership.user).to_json,
                results: serialize_results.to_json,
                data: ReportSerializer.new(report).to_json(include: '**'),
                locales: translations.to_json,
                available_translations: available_translations
    end

    def serialize_results
      if report.category_threesixty?
        Threesixty::Reports::ResultsForSubject.call!(user_report)
      else
        lookup_results.group_by { |result| result.object.assessment_id }
      end
    end

    def lookup_results
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
