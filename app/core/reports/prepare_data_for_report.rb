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
      piped_text_context = {
        subject: user_report&.user,
        threesixty_campaign: user_report&.threesixty_campaign
      }
      available_translations = Translation.available_translation_for_report(report.id, report.assessment_ids)
      broadcast :ok,
                user: Reports::UserSerializer.new.serialize(user_report&.user || membership.user).to_json,
                results: serialize_results.to_json,
                data: ReportSerializer.new(
                  context: {
                    piped_text_context: piped_text_context, membership: membership,
                    module_overrides: user_report&.text_module_overrides
                  }
                ).serialize(report).to_json,
                locales: translations(piped_text_context).to_json,
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

      Threesixty::CampaignDetailsSerializer.new(
        context: {
          user_report: user_report
        }
      ).serialize(user_report.threesixty_campaign)
    end

    def lookup_results
      assign = Assign.
               completed.
               includes(:membership, :user, :assessment).
               where(
                 memberships: { client_id: project.id, user_id: membership.user_id },
                 assessment_id: report.assessment_ids
               ).
               references(:membership)

      Panko::ArraySerializer.new(
        assign,
        each_serializer: ::AssignSerializer,
        context: {
          membership: membership
        }
      ).to_a
    end

    def translations(piped_text_context)
      Reports::GetTranslationWithPipetextReplaced.call!(
        report,
        piped_text_context: piped_text_context,
        locale: locale
      )
    end
  end
end
