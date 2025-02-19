# frozen_string_literal: true

require 'rails_helper'

describe DataReports::FieldHandlers::DatasheetValueHandler do
  let!(:campaign) { create(:campaign) }
  let!(:project) { campaign.project }
  let!(:assessment) { create(:assessment) }
  let!(:user) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:datasheet) do
    sheet = campaign.create_campaign_datasheet
    column = create(:sheet_column, sheet: sheet, name: 'test', column_type: 'string')

    row = create(:sheet_row, sheet: sheet, email: user.email)
    create(:sheet_row_datum, sheet_row: row, sheet_column: column, string_value: 'test string')
  end

  let!(:field) { { 'field_name' => 'test' } }
  let!(:field2) { { 'field_name' => 'test2' } }

  it '.call' do
    context = {
      datasheets: ::Campaigns::GetDatasheetData.call!(campaign, campaign.users.pluck(:email))
    }

    expect(described_class.call!(field, campaign_user: campaign_user, ctx: context)).to eq('test string')
    expect(described_class.call!(field2, campaign_user: campaign_user, ctx: context)).to eq(nil)
    expect(described_class.call!(field2, campaign_user: campaign_user)).to eq(nil)
  end
end
