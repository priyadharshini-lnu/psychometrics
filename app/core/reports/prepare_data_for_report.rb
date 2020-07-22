# frozen_string_literal: true

module Reports
  class PrepareDataForReport < BaseCommand
    attr_reader :project, :membership, :user_report, :report, :locale, :evaluator, :current_user

    def initialize(args)
      @project      = args[:project]
      @membership   = args[:membership]
      @user_report = args[:user_report]
      @report = args[:report] || @user_report.report
      @locale = args[:locale]
      @current_user = args[:current_user]
    end

    def call
      translations = Translation.to_hash_for_report(report.id, report.assessment_ids, locale)
      available_translations = Translation.available_translation_for_report(report.id, report.assessment_ids)
      piped_text_context = {
        subject: user_report&.user,
        threesixty_campaign: user_report&.threesixty_campaign
      }
      broadcast :ok,
                user: Reports::UserSerializer.new(user_report&.user || membership.user).to_json,
                results: serialize_results.to_json,
                data: ReportSerializer.new(report, piped_text_context: piped_text_context, membership: membership).
                  to_json(include: '**'),
                locales: translations.to_json,
                available_translations: available_translations,
                campaign: campaign_details.deep_transform_keys! { |key| key.to_s.camelize(:lower) }.to_json
    end

    def serialize_results
      if report.category_threesixty?
        Threesixty::Reports::ResultsForSubject.call!(user_report, current_user)
      else
        lookup_results.group_by { |result| result.object.assessment_id }
      end
    end

    def campaign_details
      return {} unless report.category_threesixty?

      Threesixty::CampaignDetailsSerializer.new(user_report.threesixty_campaign,
                                                user_report: user_report).to_h
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
        map { |a| ::AssignSerializer.new(a, membership: membership) }
    end
  end
end
