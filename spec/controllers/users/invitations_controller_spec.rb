# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Users::InvitationsController, type: :controller do
  let(:client) { create(:tenancy) }
  let(:project) { create(:project, client: client) }

  before(:each) do
    @request.env['devise.mapping'] = Devise.mappings[:user]
    request.host = "#{project.subdomain}.localhost"
    allow(GetProjectBySubdomain).to receive(:call!).and_return(project)
    controller.instance_variable_set(:@current_project, project)
  end

  describe '#verify_recaptcha_or_render' do
    context 'when SkipRecaptcha returns true' do
      before do
        allow(SkipRecaptcha).to receive(:call!).and_return(true)
      end

      it 'returns early without checking recaptcha' do
        allow(controller).to receive(:verify_recaptcha).and_call_original
        post :update, params: { user: { invitation_token: 'token' } }
        expect(SkipRecaptcha).to have_received(:call!)
        expect(controller).not_to have_received(:verify_recaptcha)
      end
    end

    context 'when project does not have recaptcha enabled' do
      before do
        allow(SkipRecaptcha).to receive(:call!).and_return(false)
        project.security_setting.update!(enable_recaptcha: false)
      end

      it 'returns early without rendering edit' do
        allow(controller).to receive(:verify_recaptcha).and_call_original
        post :update, params: { user: { invitation_token: 'token' } }
        expect(controller).not_to have_received(:verify_recaptcha)
      end
    end

    context 'when recaptcha is enabled and verification fails' do
      before do
        allow(SkipRecaptcha).to receive(:call!).and_return(false)
        project.security_setting.update!(enable_recaptcha: true)
        allow(controller).to receive(:verify_recaptcha).and_return(false)
      end

      it 'sets @current_project before rendering to prevent nil serializer errors' do
        post :update, params: { user: { invitation_token: 'token' } }
        expect(controller.instance_variable_get(:@current_project)).to eq(project)
      end

      it 'renders edit template' do
        post :update, params: { user: { invitation_token: 'token' } }
        expect(response).to render_template(:edit)
      end

      it 'sets flash alert message' do
        post :update, params: { user: { invitation_token: 'token' } }
        expect(flash[:alert]).to eq(I18n.t('administration.administrator.sessions.errors.recaptcha'))
      end
    end
  end
end
