# frozen_string_literal: true

module Threesixty
  module EndUser
    class ShortUserReportSerializer < Panko::Serializer
      attributes :id, :status, :is_self, :user, :qc_approval_status, :threesixty_campaign_id, :default_language,
                 :evalaution_completed_for_subject, :available_languages

      def threesixty_campaign_id
        object.campaign.threesixty_campaign.id
      end

      def user
        ::Reports::UserSerializer.new(context: { campaign: object.campaign }).serialize(object.user)
      end

      def is_self
        object.user_id == current_user.id
      end

      def qc_approval_status
        object.approval_status
      end

      def evalaution_completed_for_subject
        object.threesixty_subject&.evaluation_status_completed?
      end

      def available_languages
        other_languages = campaign_report.available_languages || []

        (other_languages + [campaign_report.effective_default_language]).uniq.map do |language|
          {
            code: language, name: I18n.t("languages.#{language}"),
            direction: Settings.rtl_languages.include?(language) ? 'rtl' : 'ltr'
          }
        end
      end

      def default_language
        locale = campaign_report.effective_default_language
        {
          code: locale, name: I18n.t("languages.#{locale}"),
          direction: Settings.rtl_languages.include?(locale) ? 'rtl' : 'ltr'
        }
      end

      private

      def campaign_report
        object.campaign_report
      end

      def current_user
        context[:current_user]
      end

      def report
        object.report
      end
    end
  end
end
