# frozen_string_literal: true

module Threesixty
  module Evaluators
    class NominateEvaluator < BaseCommand
      attr_reader :subject, :threesixty_campaign, :params, :project

      def initialize(threesixty_campaign, subject, params)
        @threesixty_campaign = threesixty_campaign
        @project = threesixty_campaign.project
        @options = @threesixty_campaign.option
        @subject = subject
        @params = params
      end

      def call
        user = user_by_options

        return broadcast :invalid, [{user: "can not be processed"}] unless user && user.persisted?

        ensure_create_campaigns_user(user)
        evaluator = find_or_create_evaluator(user)

        form = ::Threesixty::Participants::CreateForm.from_params(params)
                                                     .with_context(subject: @subject, evaluator: evaluator)

        if form.valid?
          broadcast :ok, create_participant(user)
        else
          broadcast :invalid, form.errors.messages
        end
      end

      def user_by_options
        if can_nominate_anyone?
          find_or_create_evaluator_user
        elsif can_nominate_anyone_from_datasheet?
          find_or_cretate_from_datasheet
        else
          ::Users::Regular.find_by(email: params[:evaluator_email])
        end
      end

      def user_exists?
        ::Users::Regular.exists?(email: params[:evaluator_email], project: project)
      end

      def find_or_create_evaluator_user
        if user_exists?
          ::Users::Regular.find_by(email: params[:evaluator_email], project: project)
        else
          create_evaluator_user
        end
      end

      def find_or_cretate_from_datasheet
        check_evaluator_and_create(::Users::Regular.find_by(email: params[:evaluator_email], project: project))
      end

      def check_evaluator_and_create evaluator = nil
        evaluator ||= OpenStruct.new(email: params[:evaluator_email])
        user_datasheet = threesixty_campaign.datasheet&.rows&.find_by(email: evaluator.email)
        return nil unless user_datasheet
        if limit_nomination_by_subject_from_datasheet?
          return nil unless Threesixty::Evaluators::ResolveEvaluatorCriteria.call!(threesixty_campaign, evaluator, datasheet_criteria, subject.user)
        end
        create_evaluator_user
      end

      def create_evaluator_user first_name = '', last_name = ''
        ::Users::Regular.create_with(first_name: first_name, last_name: last_name, create_by_invite: true).
                         find_or_create_by(email: params[:evaluator_email], project: project)
      end

      def ensure_create_campaigns_user(evaluator_user)
        CampaignsUser.find_or_create_by!(user: evaluator_user, campaign: threesixty_campaign.campaign)
      end

      def find_or_create_evaluator(evaluator_user)
        evaluator = ::Threesixty::Evaluator.find_or_create_by!(user: evaluator_user, campaign: threesixty_campaign.campaign)
      end

      def create_participant evaluator_user
        @subject.participants.create!(
          evaluator_id: evaluator_user.id,
          project_id: threesixty_campaign.campaign.project_id,
          campaign: threesixty_campaign.campaign,
          subject_id: subject.user_id,
          relationship_id: params[:relationship_id]
        )
      end

      private

      def can_nominate_anyone?
        @options.participants.dig('subject', 'can_nominate_anyone_not_in_assessment')
      end

      def can_nominate_anyone_from_datasheet?
        @options.participants.dig('subject', 'can_nominate_anyone_from_datasheet')
      end

      def limit_nomination_by_subject_from_datasheet?
        @options.participants.dig('subject', 'limit_nomination_by_subject_from_datasheet')
      end

      def datasheet_criteria
        @options.participants.dig('subject', 'limit_nomination_by_subject_from_datasheet_criteria')
      end
    end
  end
end
