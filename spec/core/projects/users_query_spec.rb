# frozen_string_literal: true

require 'rails_helper'

describe Projects::UsersQuery do
  let(:project) { create(:project) }
  let(:datasheet) { create(:datasheet, project: project) }

  before do
    create(:sheet_row, sheet: datasheet, email: 'tony@ferg.com')
    create(:sheet_row, sheet: datasheet, email: 'el@kwin.com')
    create(:user, email: 'tony@alal.com', project: project)
    create(:user, email: 'tony@coco.com')
  end
  it do
    result = described_class.new(project, 'ony').to_a
    expect(result.size).to eq 2
    expect(result.map(&:email)).to match_array %w[tony@ferg.com tony@alal.com]
  end
end
