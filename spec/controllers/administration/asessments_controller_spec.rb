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

  describe 'GET pearson_norms' do
    it 'gets pearson norm id and name for particulat assessment' do
      pearson_assessment_id = '123'
      expect(Pearson::GetAssessments).to receive(:call!).and_return(
        [{
          'productId' => pearson_assessment_id,
          'norms' => {
            'items' => [{
              'normId' => 'n1',
              'label' => 'norm1',
              'supportedLanguage' => 'fr'
            },
                        {
                          'normId' => 'n2',
                          'label' => 'norm2',
                          'supportedLanguage' => 'no'
                        }]
          }
        }]
      )
      get :pearson_norms, params: { pearson_assessment_id: pearson_assessment_id, pearson_norm_id: 'n1' }

      parsed_response = JSON.parse(response.body)
      expect(parsed_response).to eq([
                                      { 'id' => 'n1', 'name' => '(fr) norm1', 'selected' => true },
                                      { 'id' => 'n2', 'name' => '(no) norm2', 'selected' => false }
                                    ])
    end
  end
end
