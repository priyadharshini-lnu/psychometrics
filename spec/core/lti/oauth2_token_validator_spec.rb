# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Lti::Oauth2TokenValidator do
  let(:project) { create(:project) }
  let(:valid_token) { SecureRandom.hex(32) }
  let(:token_hash) { Digest::SHA256.hexdigest(valid_token) }
  let!(:oauth2_token) do
    create(:lti_oauth2_access_token,
           token_hash: token_hash,
           project: project,
           scope: 'https://purl.imsglobal.org/spec/lti-ags/scope/score',
           expires_at: 1.hour.from_now,
           revoked: false)
  end

  describe '#call' do
    context 'with valid token' do
      let(:validator) { described_class.new(token: valid_token) }

      it 'broadcasts valid event' do
        expect { validator.call }.to broadcast(:valid, oauth2_token)
      end
    end

    context 'with blank token' do
      let(:validator) { described_class.new(token: '') }

      it 'broadcasts invalid event' do
        expect { validator.call }.to broadcast(:invalid, 'Token is required')
      end
    end

    context 'with invalid token' do
      let(:validator) { described_class.new(token: 'invalid_token') }

      it 'broadcasts invalid event' do
        expect { validator.call }.to broadcast(:invalid, 'Invalid token')
      end
    end

    context 'with expired token' do
      let!(:expired_token_record) do
        create(:lti_oauth2_access_token,
               token_hash: Digest::SHA256.hexdigest('expired_token'),
               project: project,
               expires_at: 1.hour.ago,
               revoked: false)
      end
      let(:validator) { described_class.new(token: 'expired_token') }

      it 'broadcasts invalid event' do
        expect { validator.call }.to broadcast(:invalid, 'Invalid token')
      end
    end

    context 'with revoked token' do
      let!(:revoked_token_record) do
        create(:lti_oauth2_access_token,
               token_hash: Digest::SHA256.hexdigest('revoked_token'),
               project: project,
               expires_at: 1.hour.from_now,
               revoked: true)
      end
      let(:validator) { described_class.new(token: 'revoked_token') }

      it 'broadcasts invalid event' do
        expect { validator.call }.to broadcast(:invalid, 'Invalid token')
      end
    end

    context 'with project validation' do
      let(:other_project) { create(:project) }
      let(:validator) { described_class.new(token: valid_token, project_id: other_project.id) }

      it 'broadcasts invalid_project event for wrong project' do
        expect { validator.call }.to broadcast(:invalid_project, 'Invalid project')
      end

      let(:correct_validator) { described_class.new(token: valid_token, project_id: project.id) }

      it 'broadcasts valid event for correct project' do
        expect { correct_validator.call }.to broadcast(:valid, oauth2_token)
      end
    end

    context 'with scope validation' do
      let(:validator_with_scope) do
        described_class.new(token: valid_token, required_scope: 'https://purl.imsglobal.org/spec/lti-ags/scope/score')
      end

      it 'broadcasts valid event for correct scope' do
        expect { validator_with_scope.call }.to broadcast(:valid, oauth2_token)
      end

      let(:validator_wrong_scope) do
        described_class.new(token: valid_token, required_scope: 'https://purl.imsglobal.org/spec/lti/different/scope')
      end

      it 'broadcasts insufficient_scope event for wrong scope' do
        expect { validator_wrong_scope.call }.to broadcast(:insufficient_scope, 'Insufficient scope')
      end
    end
  end
end
