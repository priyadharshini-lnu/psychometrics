# frozen_string_literal: true

module Threesixty
  module Subjects
    class CreateAll < BaseCommand
      def initialize(subjects, threesixty_campaign)
        @subjects = subjects
        @threesixty_campaign = threesixty_campaign
        @project = threesixty_campaign.campaign.project
      end

      def call
        result = subjects.map do |_key, subject|
          subject_user = fetch_or_create_subject_user(subject)
          create_campaigns_user(subject_user)
          create_membership(subject_user)
          create_users_report(subject_user)
          create_subject(subject_user)
        end
        broadcast :ok, result
      end

      def fetch_or_create_subject_user(subject)
        project_users_indexed[subject[:email]] ||
          ::Users::Regular.create!(subject.merge(project: project, create_by_invite: true))
      end

      def create_campaigns_user(user)
        CampaignsUser.find_or_create_by!(user: user, campaign: threesixty_campaign.campaign)
      end

      def create_subject(user)
        ::Participant.create!(
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
                                   where(project_id: project.id, email: subjects.map { |_, s| s[:email] }).
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
