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
          campaigns_user = create_campaigns_user(subject)
          create_membership(campaigns_user)
          create_subject(campaigns_user)
        end
        broadcast :ok, result
      end

      def create_campaigns_user(subject)
        user = user_map[subject[:email]] || ::Users::Regular.create!(subject.merge(project: project, create_by_invite: true))
        CampaignsUser.find_or_create_by!(user: user, campaign: threesixty_campaign.campaign)
      end

      def create_subject(campaigns_user)
        ::Threesixty::Subject.find_or_create_by!(user: campaigns_user.user, campaign: threesixty_campaign.campaign)
      end

      def user_map
        @user_map ||=
          User.where(project_id: threesixty_campaign.campaign.project_id, email: subjects.map { |_, s| s[:email] }).
          index_by(&:email)
      end

      private

      attr_reader :subjects, :threesixty_campaign, :project

      def create_membership(campaigns_user)
        threesixty_campaign.project.memberships.find_or_create_by!(user_id: campaigns_user.user_id)
      end
    end
  end
end
