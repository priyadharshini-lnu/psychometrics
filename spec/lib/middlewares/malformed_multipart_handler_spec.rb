# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Middlewares::MalformedMultipartHandler do
  let(:app) { ->(env) { [200, env, ['OK']] } }
  let(:middleware) { described_class.new(app) }

  describe '#call' do
    context 'when request is valid' do
      let(:env) { Rack::MockRequest.env_for('/users/sign_in', method: 'POST') }

      it 'passes through to the app' do
        status, = middleware.call(env)
        expect(status).to eq(200)
      end
    end

    context 'when app raises Rack::Multipart::EmptyContentError' do
      let(:env) { Rack::MockRequest.env_for('/users/sign_in', method: 'POST') }

      before do
        allow(app).to receive(:call).and_raise(Rack::Multipart::EmptyContentError)
      end

      it 'returns 400 Bad Request' do
        status, headers, body = middleware.call(env)

        expect(status).to eq(400)
        expect(headers['Content-Type']).to eq('application/json')
        expect(JSON.parse(body.first)).to eq('error' => 'Bad Request')
      end
    end
  end
end
