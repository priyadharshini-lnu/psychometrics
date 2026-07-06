# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Forms::Communications::Simple do
  let(:form) { Forms::Communications::Simple.new(Communication.new(recipients: nil)) }
  let(:superadmin) { create(:superadmin) }
  let(:client_admin) { create(:client_admin) }
  let(:project_admin) { create(:project_admin) }
  let(:campaign) { create(:campaign) }
  let(:valid_params) do
    {
      client_id: campaign.client.id,
      project_id: campaign.project.id,
      campaign_id: campaign.id,
      kind: 'invitation',
      recipients: 'all',
      delivery_rule: 'send_now',
      subject: 123,
      body: '123'
    }
  end

  let(:params_without_client_id) do
    valid_params.slice!(:client_id)
  end

  let(:params_without_kind) do
    valid_params.slice!(:kind)
  end

  let(:params_without_recipients) do
    valid_params.slice!(:recipients)
  end

  let(:params_without_body) do
    valid_params.merge(body: '')
  end

  let(:params_without_subject) do
    valid_params.slice!(:subject)
  end

  let(:params_with_invalid_client_id) do
    valid_params.merge(client_id: -1)
  end

  let(:params_with_invalid_project_id) do
    valid_params.merge(project_id: -1)
  end

  let(:params_with_invalid_campaign_id) do
    valid_params.merge(campaign_id: -1)
  end

  describe 'validation' do
    it 'should be valid with valid params' do
      form.prepopulate!(current_user: superadmin)
      expect(form.validate(valid_params)).to be_truthy
    end

    it 'should not be valid without client_id' do
      form.prepopulate!(current_user: superadmin)
      expect(form.validate(params_without_client_id)).to be_falsey
    end

    it 'should not be valid without kind' do
      form.prepopulate!(current_user: superadmin)
      expect(form.validate(params_without_kind)).to be_falsey
    end

    it 'should not be valid without recipients' do
      form.prepopulate!(current_user: superadmin)
      expect(form.validate(params_without_recipients)).to be_falsey
    end

    it 'should not be valid without body' do
      form.prepopulate!(current_user: superadmin)
      expect(form.validate(params_without_body)).to be_falsey
    end

    it 'should not be valid without subject' do
      form.prepopulate!(current_user: superadmin)
      expect(form.validate(params_without_subject)).to be_falsey
    end

    it 'should not be valid with not existed client' do
      form.prepopulate!(current_user: superadmin)
      expect(form.validate(params_with_invalid_client_id)).to be_falsey
    end

    it 'should not be valid with not existed project' do
      form.prepopulate!(current_user: superadmin)
      expect(form.validate(params_with_invalid_project_id)).to be_falsey
    end

    it 'should not be valid with not existed campaign' do
      form.prepopulate!(current_user: superadmin)
      expect(form.validate(params_with_invalid_campaign_id)).to be_falsey
    end
  end

  describe 'prepopulate!' do
    let(:form_with_campaign_id_end) do
      Forms::Communications::Simple.new(Communication.new(client_id: 10, project_id: 15, campaign_id: 20))
    end

    context 'current_user is client_admin' do
      it 'sets end_level_id from campaign_id' do
        form_with_campaign_id_end.prepopulate!(current_user: client_admin)
        expect(form_with_campaign_id_end.end_level_id).to eq(form_with_campaign_id_end.campaign_id)
      end
    end

    context 'current_user is project_admin' do
      let(:form_campaign_id_end) do
        Forms::Communications::Simple.new(Communication.new(client_id: 10, project_id: 15, campaign_id: 20))
      end
      let(:form_project_id_end) do
        Forms::Communications::Simple.new(Communication.new(client_id: 10, project_id: 15))
      end
      let(:form_client_id_end) do
        Forms::Communications::Simple.new(Communication.new(client_id: 10))
      end

      it 'assign end_level_id from campaign_id' do
        form_campaign_id_end.prepopulate!(current_user: project_admin)
        expect(form_campaign_id_end.end_level_id).to eq(form_campaign_id_end.campaign_id)
      end

      it 'assign end_level_id from project_id' do
        form_project_id_end.prepopulate!(current_user: project_admin)
        expect(form_project_id_end.end_level_id).to eq(form_project_id_end.project_id)
      end

      it 'assign end_level_id from client_id' do
        form_client_id_end.prepopulate!(current_user: project_admin)
        expect(form_client_id_end.end_level_id).to eq(form_client_id_end.client_id)
      end
    end
  end
end
