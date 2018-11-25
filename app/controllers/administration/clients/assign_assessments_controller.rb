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
        @_resource = EditAssessmentsClientForm.new
      end

      # Update assigned Assessments
      #
      def update
        @assessments_clients = client.assessments_clients.includes(:assessment)
        @_resource = EditAssessmentsClientForm.
                     from_params(params[:resource]).
                     with_context(client: client)

        respond_to do |format|
          format.js do
            EditAssessmentsClient.call(resource, client) do
              on(:invalid) { render :edit }
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
