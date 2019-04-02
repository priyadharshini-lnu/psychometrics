module Reports
  class PrepareDataForReport < BaseCommand
    attr_reader :project, :subject, :membership, :report, :locale

    def initialize(args)
      @project    = args[:project]
      @campaign   = args[:campaign]
      @subject    = args[:subject]
      @membership = args[:membership]
      @report     = args[:report]
      @locale     = args[:locale]
    end

    def call
      results = Assign.
        completed.
        includes(:membership, :user).
        where(memberships: { client_id: project.id, user_id: membership.user_id }, assessment_id: report.assessment_ids).
        references(:membership).
        all
      assign = Assign.find_by(assessment_id: report.assessment_ids, membership_id: membership.id)
      assigns = Assign.where(assessment_id: report.assessment_ids, membership_id: membership.membership_with_result.id)
      translations = Translation.to_hash_for_report(report.id, report.assessment_ids, locale)
      available_translations = Translation.available_translation_for_report(report.id, report.assessment_ids)
      broadcast :ok, {
        user: Reports::UserSerializer.new(membership, assign: assign, assigns: assigns).to_json,
        results: Facades::Reports::SerializedResults.new(results, membership).results,
        data: ReportSerializer.new(report, membership: membership, assigns: assigns).to_json(include: '**'),
        locales: translations.to_json,
        available_translations: available_translations
      }
    end
  end
end
