# frozen_string_literal: true

module Threesixty
  module Subjects
    class CreateAll < BaseCommand
      def initialize(subjects, threesixty_campaign, current_user = nil)
        @subjects = subjects
        @threesixty_campaign = threesixty_campaign
        @project = threesixty_campaign.campaign.project
        @existing_subjects_whose_password_not_changed = []
        @current_user = current_user
      end

      def call
        transaction do
          result = subjects.map do |subject|
            ActiveRecord::Base.transaction do
              subject_user = fetch_or_create_subject_user(subject)
              create_campaign_user(subject_user)
              create_membership(subject_user)
              create_users_report(subject_user)
              create_subject(subject_user)
            end
          end

          broadcast :ok,
                    subjects: result,
                    existing_subjects_whose_password_not_changed: @existing_subjects_whose_password_not_changed
        end
      end

      def fetch_or_create_subject_user(subject)
        if (user = project_users_indexed[subject[:email].downcase])
          user.update!(subject.except(:password, :locale))
          user.user_profile.update!(locale: subject[:locale])
          @existing_subjects_whose_password_not_changed << user if subject[:password].present?
          user
        else
          new_user = ::Users::Regular.create!(
            subject.merge(project: project, create_by_invite: subject[:password].blank?).except(:locale)
          )
          new_user.user_profile.update!(locale: subject[:locale])
          AuditLogModule.audit!(:create, new_user, campaign: threesixty_campaign.campaign,
                                payload: subject, user: @current_user)
          new_user
        end
      end

      def create_campaign_user(user)
        CampaignUser.find_or_create_by!(user: user, campaign: threesixty_campaign.campaign)
      end

      def create_subject(user)
        # TODO: (atanych): I doubt that good way, but current licenses absolutely are not intended for threesixty
        subject_exisits = threesixty_campaign.subjects.exists?(user: user)
        unless subject_exisits
          Licenses::CreateThreesixtySubject.call!(user: user, campaign: threesixty_campaign.campaign)
          ::Threesixty::Subject.create!(user: user, campaign: threesixty_campaign.campaign)
        end
        threesixty_campaign.participants.find_or_create_by!(evaluator: user, subject: user) do |participant|
          participant.manager_nomination_status = :approved
          participant.relationship = self_relationship
        end

        ::Threesixty::Evaluator.find_or_create_by!(user: user, campaign: threesixty_campaign.campaign)
      end

      private

      attr_reader :subjects, :threesixty_campaign, :project

      def project_users_indexed
        @project_users_indexed ||= User.
                                   where(project_id: project.id, email: subjects.pluck(:email)).
                                   index_by { |user| user.email.downcase }
      end

      def create_users_report(user)
        ::UserReport.find_or_create_by(user: user,
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
