# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Warden before_failure hook with malformed multipart' do
  let(:project) { create(:project) }
  let(:user) { create(:user, project: project) }

  def build_malformed_multipart_env(path)
    Rack::MockRequest.env_for(
      path,
      method: 'POST',
      'CONTENT_TYPE' => 'multipart/form-data; boundary=----WebKitFormBoundary123',
      input: '------WebKitFormBoundary123'
    )
  end

  describe 'last_unsuccessful_attempt tracking' do
    context 'with valid params' do
      it 'updates last_unsuccessful_attempt' do
        env = Rack::MockRequest.env_for(
          "https://#{project.subdomain}.example.com/users/sign_in",
          method: 'POST',
          params: { 'user' => { 'email' => user.email } }
        )

        allow(GetProjectBySubdomain).to receive(:call!).and_return(project)

        Warden::Manager._before_failure.each { |hook| hook.first.call(env, {}) }

        expect(user.reload.last_unsuccessful_attempt).not_to be_nil
      end
    end

    context 'with malformed multipart body' do
      it 'does not raise an error' do
        env = build_malformed_multipart_env(
          "https://#{project.subdomain}.example.com/users/sign_in"
        )

        allow(GetProjectBySubdomain).to receive(:call!).and_return(project)

        expect do
          Warden::Manager._before_failure.each { |hook| hook.first.call(env, {}) }
        end.not_to raise_error
      end
    end
  end
end
