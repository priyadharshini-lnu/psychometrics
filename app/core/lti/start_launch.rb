# frozen_string_literal: true

class Lti::StartLaunch < BaseCommand
  include Rails.application.routes.url_helpers

  def initialize(context)
    @context = context
    @current_user = context[:current_user]
    @project = context[:project]
    @meta = context[:meta] || {}
  end

  def call
    if user_assessment.completed?
      return broadcast(:ok, {
        redirect_url: assessment_completed_path(campaign.id, user_assessment_id: user_assessment.id)
      })
    end

    launch_params = initiate_lti_launch

    if launch_params.present?
      return broadcast(:ok, launch_params)
    end

    broadcast(:error, 'No active LTI integration found') and return if integration.nil?
  rescue StandardError => e
    broadcast(:error, e.message)
  end

  private

  attr_reader :context, :current_user, :project, :meta

  def initiate_lti_launch
    return nil unless integration

    launch_params = {
      iss: platform_base_url,
      client_id: project.id.to_s,
      login_hint: encoded_user_assessment_id,
      lti_message_hint: product_id,
      lti_deployment_id: integration.id.to_s,
      target_link_uri: lti_config['launch_url']
    }

    {
      login_url: lti_config['login_url'],
      params: launch_params
    }
  end

  def lti_config
    integration.lti_config || {}
  end

  def integration
    @integration ||= ::Integration.find_by(name: context[:integration], project_id: context[:project], active: true)
  end

  def platform_base_url
    Utility::Url.generate(:root_url, subdomain: project.subdomain).chomp('/')
  end

  def encoded_user_assessment_id
    @encoded_user_assessment_id ||= ::UserAssessment.encode_id(user_assessment.id)
  end

  def product_id
    assessment.external_assessment_id
  end

  def campaign
    user_assessment&.campaign
  end

  def assessment
    user_assessment.assessment
  end

  def user_assessment
    @user_assessment ||= UserAssessment.find_by(id: meta[:user_assessment_id])
  end
end
