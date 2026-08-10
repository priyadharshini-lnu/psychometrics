# frozen_string_literal: true

require 'rails_helper'

describe Users::ProfileCompletion do
  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client, id: 101) }
  let!(:user) { create(:user, project: project) }
  let!(:user_profile) { create(:user_profile, user: user) }

  before do
    project.profile_setting.required_default_fields = { age: true, gender: true }
  end

  describe 'without customs' do
    it 'not finished' do
      user_profile.age = nil
      expect(described_class.call!(user)).to eq(75)
    end

    it 'finished' do
      expect(described_class.call!(user)).to eq(100)
    end
  end

  describe 'when first_name/last_name are marked required (string keys, as stored in DB)' do
    before do
      project.profile_setting.required_default_fields = { 'first_name' => true, 'last_name' => true }
    end

    it 'reaches 100% once both names are present (no double-counting)' do
      expect(user.first_name).to be_present
      expect(user.last_name).to be_present
      expect(described_class.call!(user)).to eq(100)
    end
  end

  describe 'with custom field' do
    let!(:question) do
      create(:question, validation: { 'type' => 'Range', 'args' => { 'minValue' => 2, 'maxValue' => 2 } })
    end
    let!(:profile_field) do
      create(:profile_field, required: true, profile_setting: project.profile_setting, question: question)
    end

    it 'not finished' do
      expect(described_class.call!(user)).to eq(80)
    end

    it 'finished' do
      user_profile.custom_fields = { question.id.to_s => [0] }
      expect(described_class.call!(user)).to eq(100)
    end
  end
end
