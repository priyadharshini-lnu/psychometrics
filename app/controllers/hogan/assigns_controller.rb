# frozen_string_literal: true

module Hogan
  class AssignsController < ApplicationController
    before_action :set_assign
    append_before_action :pundit_authorize
    layout false

    def results
      @report = Report.find(params[:report_id])

      Hogan::LoadResults.call(@assign, @report, @current_membership.membership_with_result, @current_project) do
        on(:not_completed) { flash[:error] = t('.not_completed') }
        on(:ok) { flash[:success] = t('.successfully') }
      end

    rescue ActiveRecord::RecordNotFound
      flash[:error] = I18n.t('administration.noty.error_500')
    ensure
      redirect_to root_path
    end

    def redirect
      @assign.update(status: :completed, completed_at: Time.current) if params[:status] == 'Completed'

      @assign.original_or_self.reports.select(&:hogan?).each do |report|
        Hogan::LoadResults.call!(@assign, report, @current_membership.membership_with_result, @current_project)
      end

      redirect_to root_path
    end

    def pass
      Hogan::PassAssessment.call(@assign, @current_membership.membership_with_result, @current_project) do
        on(:ok)      { render(:pass) }
        on(:invalid) { render(:error, locals: { message: t('errors.error_500') }) }
      end
    end

    private

    def set_assign
      @assign = policy_scope(Assign).find(params[:id])
    end

    # Authorisation user
    def pundit_authorize
      authorize @assign || Assign
    end
  end
end
