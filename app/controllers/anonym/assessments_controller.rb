# frozen_string_literal: true

module Anonym
  class AssessmentsController < ActionController::Base
    include SetLocale
    layout 'anonym'
    protect_from_forgery with: :exception

    prepend_before_action :set_assessments_client
    before_action :set_client, only: [:pass]
    before_action :set_assessment, only: [:pass]
    before_action :find_or_create_anonymous_user, only: [:pass]

    ANONYM_COOKIE_KEY = 'tte-anonym-payload'

    def pass
      redirect_to(action: 'error', reason: 'archived') && return if @resource.archived?
      redirect_to(action: 'error', reason: 'expired') && return if @assessments_client.expired?
      redirect_to(action: 'error', reason: 'not_active') && return unless @assessments_client.enable_universal_links?

      @translations = ::Translation.to_hash_for_assessment(@resource.id, user_locale)
      @available_translations = ::Translation.available_translation_for_assessment(@resource.id)
      # Find or create assign
      @assign = Assign.find_or_create_by(assessment_id: @resource.id, membership_id: @current_membership.id)

      update_anonym_cookie(assign: @assign.as_json)
    end

    def error; end

    private

    def set_assessments_client
      @assessments_client = ::AssessmentsClient.find_by assessment_key: params[:assessment_key]
    end

    def set_client
      @client = Client.enabled.find @assessments_client.client_id
    end

    def set_assessment
      @resource = @client.assessments.enabled.find @assessments_client.assessment_id
    end

    def find_or_create_anonymous_user
      u = if cookies[ANONYM_COOKIE_KEY]
            attrs = JSON.parse(cookies[ANONYM_COOKIE_KEY])

            User.find_by(email: attrs['email'])
          else
            build_anonym_user
          end

      saved = u.new_record? ? u.save! : true
      return unless saved

      set_anonym_cookie(u)
      bypass_sign_in(u)

      @current_membership = u.memberships.first
    end

    def build_anonym_user
      # Generate uniq anonym user email
      uniq_anonym_email = loop do
        email = "anonym#{Time.now.to_i}#{rand(10_000)}@example.com"
        break email unless User.exists?(email: email)
      end

      # Build anonym user with membership
      User.new(
        role: User::REGULAR_ROLE,
        first_name: 'Anonymous',
        last_name: 'User',
        email: uniq_anonym_email,
        is_anonym: true,
        password: uniq_anonym_email,
        password_confirmation: uniq_anonym_email,
        memberships_attributes: [{
          client_id: @client.id
        }]
      )

      return unless user.save

      bypass_sign_in(user)
      @current_membership = user.memberships.first
    end

    def set_anonym_cookie(user)
      cookie_payload = user.cookie_params.merge(
        'memberships_attributes' => [{ client_id: @client.id }]
      )

      save_cookie(cookie_payload)
    end

    def update_anonym_cookie(with_changes)
      cookie_payload = ActiveSupport::JSON.decode(cookies[ANONYM_COOKIE_KEY])
      return if cookie_payload.nil?

      save_cookie(cookie_payload.merge(with_changes))
    end

    def save_cookie(payload, options = { expires: 1.hour.from_now }, name = ANONYM_COOKIE_KEY)
      cookies[name] = options.merge(
        value: payload.to_json,
        domain: request.host,
        path: request.fullpath
      )
    end

    def delete_anonym_user_cookie
      cookies.delete(ANONYM_COOKIE_KEY, domain: request.fullpath)
    end
  end
end
