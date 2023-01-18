# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Administration::AssessmentsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:assessment) { create(:assessment) }
  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  it 'DELETE soft_delete' do
    delete :soft_delete, params: { id: assessment.id }, format: :js

    expect(assessment.reload.deleted_at).to_not eq(nil)
    expect(assessment.deleted_by).to eq(current_user)
    expect(response).to render_template('soft_delete')
  end

  it 'PUT restore' do
    assessment.soft_delete!(current_user)
    put :restore, params: { id: assessment.id }, format: :js

    expect(assessment.reload.deleted_at).to eq(nil)
    expect(assessment.deleted_by).to eq(nil)
    expect(response).to render_template('refresh_list')
  end

  describe 'GET projects' do
    it 'get projects of passed owner_id/client whose iiht integration is active' do
      client = create(:tenancy)
      project_with_iiht = create(:project, parent: client)
      create(:integration, name: :iiht, active: true, project: project_with_iiht)
      _project_without_iiht = create(:project, parent: client)

      get :projects, params: { owner_id: client.id, type: Assessment::TYPES[:iiht] }

      parsed_response = JSON.parse(response.body)
      expect(parsed_response).to eq(
        [
          { 'id' => project_with_iiht.id, 'name' => project_with_iiht.name, 'selected' => false }
        ]
      )
    end
  end

  describe 'GET external_assessments' do
    it 'gets iiht assessment details' do
      project = create(:project)
      create(:integration, name: :iiht, active: true, project: project)
      expect(Iiht::GetAssessments).to receive(:call!).and_return(
        [
          { 'assessmentIdNumber' => '1', 'name' => 'test1' },
          { 'assessmentIdNumber' => '2', 'name' => 'test2' }
        ]
      )

      get :external_assessments, params: {
        project_id: project.id, type: Assessment::TYPES[:iiht], external_assessment_id: '2'
      }

      parsed_response = JSON.parse(response.body)
      expect(parsed_response).to eq(
        [
          { 'id' => '1', 'name' => 'test1', 'selected' => false },
          { 'id' => '2', 'name' => 'test2', 'selected' => true }
        ]
      )
    end

    it 'gets pearson assessment details' do
      project = create(:project)
      pearson_assessment1  = create(:pearson_assessment)
      pearson_assessment2  = create(:pearson_assessment)

      get :external_assessments, params: {
        project_id: project.id, type: Assessment::TYPES[:pearson],
        external_assessment_id: pearson_assessment1.product_id
      }

      parsed_response = JSON.parse(response.body)
      expect(parsed_response).to match_array(
        [
          { 'id' => pearson_assessment1.product_id, 'name' => pearson_assessment1.title, 'selected' => true },
          { 'id' => pearson_assessment2.product_id, 'name' => pearson_assessment2.title, 'selected' => false }
        ]
      )
    end
  end

  describe 'GET pearson_norms' do
    it 'gets pearson norm id and name for particulat assessment' do
      pearson_assessment_id = '123'
      create(:pearson_assessment,
             product_id: pearson_assessment_id,
             norms: {
               'items' => [
                 {
                   'normId' => 'n1',
                   'label' => 'norm1',
                   'supportedLanguage' => 'fr'
                 },
                 {
                   'normId' => 'n2',
                   'label' => 'norm2',
                   'supportedLanguage' => 'no'
                 }
               ]
             })
      get :pearson_norms, params: { pearson_assessment_id: pearson_assessment_id, pearson_norm_id: 'n1' }

      parsed_response = JSON.parse(response.body)
      expect(parsed_response).to eq([
        { 'id' => 'n1', 'name' => '(fr) norm1', 'selected' => true },
        { 'id' => 'n2', 'name' => '(no) norm2', 'selected' => false }
      ])
    end
  end
end
