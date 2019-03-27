# frozen_string_literal: true

module Administration
  module Clients
    module Users
      class AssignAssessmentsController < Administration::BaseController
        include Administration::Clients
        before_action :set_membership
        before_action :ensure_not_root
        append_before_action :pundit_authorize

        # Assign Assessments to User
        #
        def new
          @assessments = client.assessments.where.not(id: membership.assessment_ids)
          @_resource = AssignAssessmentsForm.new(assessment_ids: client.assessment_ids)
        end

        # Assign Assessments to Client and Users
        #
        def create
          @assessments = client.assessments.where.not(id: membership.assessment_ids)
          @_resource = AssignAssessmentsForm.
                       from_params(params[:resource]).
                       with_context(client_assessment_ids: client.assessment_ids,
                                    membership_assessment_ids: membership.assessment_ids)

          respond_to do |format|
            format.js do
              AssignAssessments.call(resource, membership) do
                on(:invalid) { render :new }
              end
            end
          end
        end

        def i18n
          'clients.assign_assessments'
        end

        private

        def set_membership
          @_membership = policy_scope(::Membership).join_user.find(params[:user_id])
          @_client = membership.client
        end

        def pundit_authorize
          authorize :assessment_client
        end
      end
    end
  end
end
