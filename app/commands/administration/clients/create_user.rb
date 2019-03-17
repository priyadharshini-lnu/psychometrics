# frozen_string_literal: true

module Administration
  module Clients
    class CreateUser < Rectify::Command
      def initialize(form, clients, current_user)
        @form = form
        @clients = clients
        @current_user = current_user
      end

      def call
        return broadcast(:invalid, form) if form.invalid?
        transaction do
          clients.each do |client|
            create_membership_and_user(client)
            apply_assigned_assessments(client)
            apply_reports(client)
          end
        end

        broadcast(:ok, membership.user)
      rescue ActiveRecord::RecordInvalid, Errors::LicenseError => e
        form.errors.add(:base, e.message)
        broadcast(:invalid, form)
      end

      private

      attr_reader :clients, :current_user, :membership_params, :form, :membership

      def create_membership_and_user(client)
        @membership = client.memberships.new(form.membership_attributes)
        membership.user = User.find_or_initialize_by(email: form.email, project_id: client.project.id)
        if membership.user.new_record?
          membership.user.assign_attributes(form.user_attributes)

          # Sets invitation data
          membership.user.tap do |u|
            u.create_by_invite = true
            u.created_by_id = current_user.id
            u.modified_by_id = current_user.id
          end
        end

        membership.save!
      end

      def apply_assigned_assessments(client)
        client.assessment_ids.each do |assessment_id|
          assign = membership.assigns.find_or_create_by(assessment_id: assessment_id)
        end
      end

      def apply_reports(client)
        client.clients_reports.includes(report: :assessments).each do |client_report|
          client_report.report.assessments.each do |assessment|
            assign = membership.assigns.find_or_create_by(assessment_id: assessment.id)
            assign_report = assign.assigns_reports.find_or_initialize_by(report_id: client_report.report_id)
            assign_report.user_access = client_report.user_access
            assign_report.save!
          end
        end
      end
    end
  end
end
