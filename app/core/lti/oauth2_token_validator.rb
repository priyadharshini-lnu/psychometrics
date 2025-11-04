# frozen_string_literal: true

module Lti
  class Oauth2TokenValidator < BaseCommand
    attr_reader :token, :required_scope, :project_id

    def initialize(token:, required_scope: nil, project_id: nil)
      @token = token
      @required_scope = required_scope
      @project_id = project_id
    end

    def call
      if token.blank?
        broadcast(:invalid, 'Token is required')
        return { success: false, error: 'Token is required' }
      end

      token_record = Lti::Oauth2AccessToken.find_by_token(token) # rubocop:disable Rails/DynamicFindBy

      unless token_record
        broadcast(:invalid, 'Invalid token')
        return { success: false, error: 'Invalid token' }
      end

      if token_record.revoked
        broadcast(:revoked, 'Token revoked')
        return { success: false, error: 'Token revoked' }
      end

      if project_id && token_record.project_id != project_id
        broadcast(:invalid_project, 'Invalid project')
        return { success: false, error: 'Invalid project' }
      end

      if required_scope && !has_required_scope?(token_record)
        broadcast(:insufficient_scope, 'Insufficient scope')
        return { success: false, error: 'Insufficient scope' }
      end

      token_record.update_column(:last_used_at, Time.current)

      broadcast(:valid, token_record)
      { success: true, token_record: token_record }
    end

    private

    def has_required_scope?(token_record)
      token_scopes = token_record.scopes_array
      required_scopes = Array(required_scope)

      (required_scopes - token_scopes).empty?
    end
  end
end
