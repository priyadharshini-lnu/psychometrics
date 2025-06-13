# frozen_string_literal: true

module UserReports
  class FetchModuleContent
    private_attr_reader :user_report_event, :module_id

    def initialize(user_report_event)
      @user_report_event = user_report_event
      @module_id = user_report_event.details['module']
    end

    def call
      return nil unless module_id

      if user_report_event.event_type == 'removed_text'
        return strip_tags(user_report_event.details['content'])
      end

      latest_event_content || original_module_content
    end

    def original_module_content
      context = build_piped_text_context
      text = Threesixty::PipedText::Perform.call!(
        user_report_event.module_content, context
      )

      strip_tags(text)
    end

    private

    def latest_event_content
      latest_event = fetch_latest_event_with_content
      return unless latest_event

      if latest_event.event_type == 'removed_text'
        original_module_content
      else
        strip_tags(latest_event.details['content'])
      end
    end

    def fetch_latest_event_with_content
      UserReportEvent.
        where(user_report_id: user_report_event.user_report_id).
        where('event_type LIKE ?', '%_text').
        where("details->>'module' = ?", module_id.to_s).
        where('created_at < ?', user_report_event.created_at).
        where("details->>'content' IS NOT NULL").
        order(created_at: :desc).
        first
    end

    def build_piped_text_context
      {
        subject: user_report_event.user_report.user,
        evaluator: user_report_event.user_report.user,
        campaign: user_report_event.user_report.campaign
      }
    end

    def strip_tags(content)
      ActionController::Base.helpers.strip_tags(content)
    end
  end
end
