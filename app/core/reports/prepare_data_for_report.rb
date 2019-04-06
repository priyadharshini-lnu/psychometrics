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
      translations = Translation.to_hash_for_report(report.id, report.assessment_ids, locale)
      available_translations = Translation.available_translation_for_report(report.id, report.assessment_ids)
      broadcast :ok, {
        user: Reports::UserSerializer.new(membership).to_json,
        results: serialize_results.to_json,
        data: ReportSerializer.new(report).to_json(include: '**'),
        locales: translations.to_json,
        available_translations: available_translations
      }
    end

    def serialize_results
      results = Assign.
        completed.
        includes(:membership, :user).
        where(memberships: { client_id: project.id, user_id: membership.user_id }, assessment_id: report.assessment_ids).
        references(:membership).
        all
      results.group_by(&:assessment_id).transform_values do |group|
        group.map { |a| ::AssignSerializer.new(a) }
      end
    end
  end
end
