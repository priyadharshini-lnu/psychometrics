# frozen_string_literal: true

module AI
  module AssistableService
    class Idp < Base
      class ServiceConfigurationError < StandardError; end

      private_attr_reader :locale

      def initialize(plan, current_user, instructions = nil, options = {})
        @locale = options[:locale]

        super(plan, current_user, instructions, options.merge(ignore_user_prompt: true))
      end

      def call
        unless assistable_enabled?
          return broadcast(:error,
                           I18n.t('administration.ai_assistants.errors.one_click_idp_assistance_not_enabled'))
        end

        mark_session_in_progress!

        assistant_service.
          on(:ok) do |assistant_response|
            handle_assistant_service_success(assistant_response)
          end.
          on(:error) do |error_message, error|
            handle_assistant_service_error(error_message, error)
          end.
          call
      rescue ServiceConfigurationError => e
        handle_assistant_service_error(e.message, e)
      end

      private

      # TODO: prompt templating is now applicable only for IDP assistant,
      # in future this should be extended to other assistables
      def prompt_template_context
        {
          campaign: campaign,
          user: current_user
        }
      end

      def handle_assistant_service_error(error_message, error = nil)
        error_response, error_meta = handle_assistant_error_response(error_message, error)
        mark_session_failed!(error_response, meta: error_meta)
        broadcast(:error, error_response)
      end

      def handle_assistant_service_success(assistant_response)
        mark_session_completed!
        broadcast(:ok, {
          content: assistant_response[:message],
          role: 'assistant'
        })
      end

      def assistant
        @assistant ||= idp_template.one_click_ai_assistant
      end

      def assistant_context
        <<~CONTEXT
          <session_context>
            #{user_dependency.parse}
            #{campaign_user_dependency.parse}
            #{plan_dependency}
          <session_context>
        CONTEXT
      end

      def assistant_tools
        tools = []

        if idp_template.document_analysis_ai_assistant_id.present?
          tools << AI::Tools::Idp::AttachmentAnalysis.new(
            assistable,
            current_user,
            document_analysis_assistant
          )
        end

        if idp_template.skill_gap_report_analysis_ai_assistant_id.present?
          tools << AI::Tools::Idp::SkillGapReportAnalysis.new(
            assistable,
            current_user,
            skill_gap_report_analysis_assistant
          )
        end

        tools << AI::Tools::Idp::AddSkillToPlan.new(assistable, current_user)
        tools << AI::Tools::Idp::AvailableSkillsAndDevelopmentActions.new(assistable)

        tools
      end

      def session_model
        AI::AssistedUserIdpSession
      end

      def assistable_enabled?
        Settings.features.ai_assistant_enabled &&
          project_feature.ai_assisted_idp? &&
          idp_template.one_click_idp_enabled
      end

      def document_analysis_assistant
        @document_analysis_assistant ||= idp_template.document_analysis_ai_assistant
      end

      def skill_gap_report_analysis_assistant
        @skill_gap_report_analysis_assistant ||= idp_template.skill_gap_report_analysis_ai_assistant
      end

      def mark_session_in_progress!
        session.mark_as_in_progress!
        assistable.start_ai_assistance! if assistable.not_started?
      end

      def idp_template
        @idp_template ||= assistable.idp_template
      end

      def user_dependency
        AI::Utils::DependencyParser::UserData.new(
          current_user,
          custom_fields: %w[role department organization],
          # This is handling the case when the assistant is used to bulk create IDPs for users in a specific language
          # By default User.locale is used if no locale is passed
          locale: locale
        )
      end

      def plan_dependency
        <<~CONTEXT
          <user_idp_document>
            <filename>#{user_idp_document_attachment&.filename}</filename>
            <document_analysis_status>#{ai_assisted_user_document_summary&.status}</document_analysis_status>
          </user_idp_document>
        CONTEXT
      end

      def campaign_user_dependency
        AI::Utils::DependencyParser::CampaignUser.new(campaign_user)
      end

      def campaign_user
        @campaign_user ||= CampaignUser.find_by(user: current_user, campaign: campaign)
      end

      def campaign
        @campaign ||= assistable.campaign
      end

      def user_idp_document_attachment
        @user_idp_document_attachment ||= assistable.user_document&.attachment
      end

      def ai_assisted_user_document_summary
        @ai_assisted_user_document_summary ||= user_idp_document_attachment&.ai_assisted_user_document_summary
      end

      def project_feature
        @project_feature ||= campaign.project.project_feature
      end
    end
  end
end
