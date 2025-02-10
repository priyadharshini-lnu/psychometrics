# frozen_string_literal: true

require 'rails_helper'

describe Api::V2::DataReport::ConfigurationForm do
  let!(:campaign) { create(:campaign) }
  let!(:project) { campaign.project }
  let!(:assessment) { create(:assessment) }
  let!(:user) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:campaign_assessment) { create(:campaign_assessment, campaign: campaign, assessment: assessment) }
  let!(:user_assessment) do
    create(:user_assessment, subject: user, assessment: assessment, status: :completed, completed_at: Time.current)
  end
  let!(:factor) { create(:factor, dimension: assessment.dimension) }
  let!(:campaign_factor) do
    create(:campaign_factor, campaign: campaign, output_type: 'numeric',
      factor_type: :formula, code: 'code', formula: 'return 4')
  end

  let(:valid_json) do
    <<~JSON.squish
      {
        "project_ids": [#{project.id}],
        "sections": [{
          "name": "Hello",
          "cell_format": {
            "font_size": 14
          },
          "columns": [{
            "name": "score",
            "assessment_id": #{assessment.id},
            "factor_id": #{factor.id},
            "type": "assessment_score",
            "score_type": "score"
          }, {
            "name": "norm_score",
            "assessment_id": #{assessment.id},
            "factor_id": #{factor.id},
            "type": "assessment_score",
            "score_type": "norm_score"
          },{
            "name": "zscore",
            "assessment_id": #{assessment.id},
            "factor_id": #{factor.id},
            "type": "assessment_score",
            "score_type": "zscore"
          },{
            "name": "percentage",
            "assessment_id": #{assessment.id},
            "factor_id": #{factor.id},
            "type": "assessment_score",
            "score_type": "percentage"
          }, {
            "name": "Overall Potential",
            "type": "campaign_score",
            "factor_code": "code"
          },{
            "name": "Emirates ID",
            "type": "user_detail",
            "field_name": "first_name"
          },{
            "name": "Job Role",
            "type": "datasheet_value",
            "field_name": "test"
          },{
            "name": "Thriving index status",
            "type": "user_assessment_detail",
            "field_name": "status",
            "assessment_id": #{assessment.id}
          },{
            "name": "Thriving index status",
            "type": "user_assessment_detail",
            "field_name": "completed_at",
            "assessment_id": #{assessment.id},
            "date_format": "%d-%b-%Y"
          }]
        }, {
          "name": "User Details",
          "cell_format": {
            "font_size": 14,
            "bg_color": "green"
          },
          "columns": [{
            "name": "First Name",
            "type": "user_detail",
            "field_name": "first_name"
          }, {
            "name": "Emirates ID",
            "type": "user_detail",
            "field_name": "EmiratesID"
          },{
            "name": "Job Role",
            "type": "datasheet_value",
            "field_name": "Job Role"
          }, {
            "name": "Project id",
            "type": "project_detail",
            "field_name": "project_id"
          }, {
            "name": "Project name",
            "type": "project_detail",
            "field_name": "project_name"
          }, {
            "name": "campaign id",
            "type": "campaign_detail",
            "field_name": "campaign_id"
          }, {
            "name": "campaign name",
            "type": "campaign_detail",
            "field_name": "campaign_name"
          }]
        }]
      }
    JSON
  end

  let!(:invalid_json) { '{a}' }

  it '.call with valid' do
    form = described_class.new(configuration: valid_json).with_context(client_id: project.client.id)

    expect(form.valid?).to eq(true)
  end

  it '.call with invalid' do
    form = described_class.new(configuration: invalid_json)

    expect(form.valid?).to eq(false)
  end

  it '.call with empty config' do
    form = described_class.new(configuration: '{}').with_context(client_id: project.client.id)

    expect(form.valid?).to eq(false)
    expect(form.errors.full_messages).to eq(['Configuration project_ids or campaign_ids is required',
                                             'Configuration sections is required'])
  end

  it '.call with project and campaign ids' do
    config = '{"project_ids": [1], "campaign_ids": [2]}'
    form = described_class.new(configuration: config).with_context(client_id: project.client.id)

    expect(form.valid?).to eq(false)
    expect(form.errors.full_messages).to eq([
      'Configuration project_ids and campaign_ids should not be specified together',
      'Configuration sections is required'
    ])
  end
end
