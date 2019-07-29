# frozen_string_literal: true

module Threesixty
  module Subjects
    class CreateAll < BaseCommand
      def initialize(subjects, threesixty_campaign)
        @subjects = subjects
        @threesixty_campaign = threesixty_campaign
        @project = threesixty_campaign.campaign.project
        @existing_subjects_whose_password_not_changed = []
      end

      def call
        transaction do
          result = subjects.map do |subject|
            subject_user = fetch_or_create_subject_user(subject)
            create_campaigns_user(subject_user)
            create_membership(subject_user)
            create_users_report(subject_user)
            create_subject(subject_user)
          end

          broadcast :ok, subjects: result, existing_subjects_whose_password_not_changed: @existing_subjects_whose_password_not_changed
        end
      end

      def fetch_or_create_subject_user(subject)
        if user = project_users_indexed[subject[:email]]
          user.update!(subject.except(:password))
          @existing_subjects_whose_password_not_changed << user if subject[:password].present?
          user
        else
          ::Users::Regular.create!(subject.merge(project: project, create_by_invite: subject[:password].blank?))
        end
      end

      def create_campaigns_user(user)
        CampaignsUser.find_or_create_by!(user: user, campaign: threesixty_campaign.campaign)
      end

      def create_subject(user)
        # TODO (atanych): I doubt that good way, but current licenses absolutely are not intended for threesixty
        AssignsReport::LICENSES[Assessment::THREESIXTY].use(user: user, campaign: threesixty_campaign.campaign)
        ::Threesixty::Participant.create!(
          evaluator: user,
          subject: user,
          manager_nomination_status: :approved,
          relationship: self_relationship,
          project_id: threesixty_campaign.campaign.project_id,
          campaign: threesixty_campaign.campaign
        )
        ::Threesixty::Evaluator.find_or_create_by!(user: user, campaign: threesixty_campaign.campaign)
        ::Threesixty::Subject.create!(user: user, campaign: threesixty_campaign.campaign)
      end

      private

      attr_reader :subjects, :threesixty_campaign, :project

      def project_users_indexed
        @project_users_indexed ||= User.
                                   where(project_id: project.id, email: subjects.map { |s| s[:email] }).
                                   index_by(&:email)
      end

      def create_users_report(user)
        ::UsersReport.find_or_create_by(user: user,
                                        report: threesixty_campaign.report,
                                        campaign: threesixty_campaign.campaign)
      end

      def create_membership(user)
        threesixty_campaign.project.memberships.find_or_create_by!(user_id: user.id)
      end

      def self_relationship
        @self_relationship ||= Relationship.self_relationship
      end
    end
  end
end
