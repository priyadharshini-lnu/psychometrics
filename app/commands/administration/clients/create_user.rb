# frozen_string_literal: true

module Administration
  module Clients
    class CreateUser < Rectify::Command
      def initialize(form, client, current_user)
        @form = form
        @client = client
        @current_user = current_user
      end

      def call
        return broadcast(:invalid, form) if form.invalid?
        transaction do
          create_membership_and_user
          apply_assigned_assessments
          apply_reports
          assign_campaigns
        end

        broadcast(:ok, membership.user)
      rescue ActiveRecord::RecordInvalid, Errors::LicenseError => e
        form.errors.add(:base, e.message)
        broadcast(:invalid, form)
      end

      private

      attr_reader :client, :current_user, :membership_params, :form, :membership

      def create_membership_and_user
        @membership = client.memberships.new(form.membership_attributes)
        membership.user = User.find_or_initialize_by(email: form.email, project_id: client.project.id)
        membership.user.assign_attributes(form.user_attributes)

        # Sets invitation data
        membership.user.tap do |u|
          u.create_by_invite = true
          u.created_by_id = current_user.id
          u.modified_by_id = current_user.id
        end

        membership.save!
      end

      def apply_assigned_assessments
        client.assessment_ids.each do |assessment_id|
          assign = membership.assigns.find_or_create_by(assessment_id: assessment_id)
        end
      end

      def apply_reports
        client.clients_reports.includes(report: :assessments).each do |client_report|
          client_report.report.assessments.each do |assessment|
            assign = membership.assigns.find_or_create_by(assessment_id: assessment.id)
            assign_report = assign.assigns_reports.find_or_initialize_by(report_id: client_report.report_id)
            assign_report.user_access = client_report.user_access
            assign_report.save!
          end
        end
      end

      def assign_campaigns
        (form.campaign_ids).each do |client_id|
          membership.user.memberships.create!(role: Membership::MEMBER_ROLE, client_id: client_id)
        end
      end
    end
  end
end
