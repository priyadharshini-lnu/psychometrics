# frozen_string_literal: true

module Administration
  module Clients
    class AssignAssessmentsController < Administration::BaseController
      include Administration::Clients
      before_action :ensure_not_root
      append_before_action :pundit_authorize

      # Assign Assessments to Client and Users
      # @assessments
      #   Fetchs all Assessments where owner is Client
      #   Exclude already assigned assessments
      # @form
      #   Form Object
      def new
        @assessments = Assessment.enabled.where(owner: client.client).where.not(id: client.assessment_ids)
        @_resource = NewAssessmentsClientForm.new(assessment_ids: client.assessment_ids)
      end

      # Assign Assessments to Client and Users
      # @assessments
      #   Fetchs all Assessments where owner is Client
      #   Exclude already assigned assessments
      # @form
      #   Form Object
      def create
        @assessments = Assessment.enabled.where(owner: client.client).where.not(id: client.assessment_ids)
        @_resource = NewAssessmentsClientForm.
                     from_params(params[:resource]).
                     with_context(client: client, owner: client.client)

        respond_to do |format|
          format.js do
            NewAssessmentsClient.call(resource, client) do
              on(:invalid) { render :new }
            end
          end
        end
      end

      # Edit assigned Assessments
      #
      def edit
        @assessments_clients = client.assessments_clients.includes(:assessment)
        @_resource = ::Clients::Assessments::UpdateAssessmentForm.new
      end

      # Update assigned Assessments
      #
      def update
        @assessments_clients = client.assessments_clients.includes(:assessment)
        @_resource = ::Clients::Assessments::UpdateAssessmentForm.
                     from_params(params[:resource]).
                     with_context(client: client)

        respond_to do |format|
          format.js do
            ::Clients::Assessments::UpdateAssessment.call(resource, client) do
              on(:invalid) { render :edit }
              on(:confirm_remove_dependent_reports) do |remove_reports|
                report_names = remove_reports.
                               map { |report| report.decorate.display_name }.
                               join(', ')
                render :confirm_remove_dependent_reports, locals: { report_names: report_names }
              end
            end
          end
        end
      end

      def i18n
        'clients.assign_assessments'
      end

      private

      def pundit_authorize
        authorize :assessment_client
      end
    end
  end
end
