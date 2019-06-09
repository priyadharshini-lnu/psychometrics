# frozen_string_literal: true

module Threesixty
  module Subjects
    class Import < BaseCommand
      def initialize(subjects, threesixty_campaign)
        @subjects = subjects
        @threesixty_campaign = threesixty_campaign
        @errors = []
        @existing_users_whose_password_not_changed = []
      end

      def call
        subjects.each do |subject|
          existing_user = ::Threesixty::Subject.
            joins(:user).
            where(campaign: threesixty_campaign.campaign, users: { email: subject[:email] }).
            exists?
          if existing_user && subject[:password].present?
            existing_subject_whose_password_not_changed << subject
          end
        end

        create_subjects(subjects)

        { existing_subject_whose_password_not_changed: existing_subject_whose_password_not_changed }
      end

      private

      attr_accessor :errors, :existing_subject_whose_password_not_changed
      attr_reader :subjects, :threesixty_campaign

      def create_subjects(subjects_attributes)
        ActiveRecord::Base.transaction { CreateAll.call!(subjects_attributes, threesixty_campaign) }
      end
    end
  end
end
