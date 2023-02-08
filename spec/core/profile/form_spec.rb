# frozen_string_literal: true

require 'rails_helper'

describe Users::ProfileForm do
  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client, id: 101) }
  let!(:user) { create(:user, project: project) }
  let!(:question) do
    create(:question, validation: { 'type' => 'Range', 'args' => { 'minValue' => 2, 'maxValue' => 2 } })
  end
  let!(:profile_field) do
    create(:profile_field, required: true, profile_setting: project.profile_setting, question: question)
  end

  describe 'valid' do
    it do
      params = {
        first_name: user.first_name,
        last_name: user.last_name,
        custom_fields: { question.id => [0, 1] }
      }
      form = described_class.from_params(params).with_context(user: user, project: project)
      expect(form.valid?).to be_truthy
    end
  end

  describe 'invalid required' do
    it do
      params = {
        first_name: user.first_name,
        last_name: user.last_name,
        custom_fields: {}
      }
      form = described_class.from_params(params).with_context(user: user, project: project)
      expect(form.valid?).to be_falsey
      expect(form.errors.messages[question.name.to_sym]).to include('required')
    end
  end

  describe 'invalid validation' do
    it do
      params = {
        first_name: user.first_name,
        last_name: user.last_name,
        custom_fields: { question.id => [0] }
      }
      form = described_class.from_params(params).with_context(user: user, project: project)
      expect(form.valid?).to be_falsey
      expect(form.errors.messages[question.name.to_sym]).to include('Please select from 2 to 2 choices')
    end
  end
end
