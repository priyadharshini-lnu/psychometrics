# frozen_string_literal: true

module CampaignUsers
  module AssignReportsAndAssessments
    class ProcessImport < BaseCommand
      private_attr_reader :campaign, :current_user, :rows, :job_record

      def initialize(campaign, current_user, rows, job_record)
        @campaign = campaign
        @current_user = current_user
        @rows = rows
        @job_record = job_record
      end

      def call # rubocop:disable Metrics/AbcSize
        transaction do
          job_record.update!(total_tasks: rows.length)

          reports = Report.where(id: rows.pluck(:report_id))
          assessments = Assessment.where(id: rows.pluck(:assessment_id))

          batches = (rows.size / 100) + 1
          batches.times do |batch|
            batch_rows = rows[batch * 100, 100]
            user_emails = batch_rows.pluck(:email)

            users = campaign.users.where(email: user_emails)
            campaign_users = campaign.campaign_users.where(user_id: users.pluck(:id))

            batch_rows.each do |attrs|
              user = users.find { |u| u.email == attrs[:email] }
              campaign_user = campaign_users.find { |cu| cu.user_id == user.id }

              next unless user && campaign_user

              report = reports.find { |r| r.id == attrs[:report_id].to_i }
              assessment = assessments.find { |a| a.id == attrs[:assessment_id].to_i }

              Campaigns::Users::AddReport.call(campaign_user, report, {
                assessments: [assessment],
                report_family_id: attrs[:report_bundle_id].to_i,
                current_user: current_user
              })

              job_record.increment_completed_tasks!
            end
          end
        end
        broadcast :ok
      rescue Licenses::NotEnoughError => e
        job_record.update(exception: e.message, status: :failed)
      end
    end
  end
end
