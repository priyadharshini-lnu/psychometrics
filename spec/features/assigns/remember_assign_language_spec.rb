# -*- coding: utf-8 -*-
require 'rails_helper'

feature 'Incomplete assessment should continue in the same language' do
  let(:question_text_en) { 'Work Preferences Survey' }
  let(:question_text_ar) { 'استبيان تفضيلات العمل' }

  let!(:project) { create(:project) }
  let!(:assessment) { project.assessments.take }
  let!(:question) { create(:question, assessment_id: assessment.id, position: 1, type: 'StaticContent',
                           props: {'questionText' => question_text_en, 'hasValidations' => false, 'type' => 'Text'},
                           block: create(:block, assessment_id: assessment.id)) }
  let!(:report) { create(:report, assessment: assessment) }
  let!(:user) { create(:user) }
  let!(:membership) { create(:membership, user: user, client: project) }
  let!(:clients_report) { create(:clients_report, client: project, report: report) }
  let!(:assign) { create(:assign, assessment: assessment, membership: membership) }

  let!(:translation) do
    Translation.create(translateable_id: question.id,
                       translateable_type: 'Question',
                       resource_id: assessment.id,
                       resource_type: Assessment::TYPES[:common],
                       locale: 'ar',
                       props: {'questionText' => question_text_ar})
  end

  let(:dashboard_url) { root_url(subdomain: project.project.subdomain, domain: Settings.domain, port: Settings.port) }

  before do
    login_as(user)
  end

  scenario 'resume assessment after changing assessment language', js: true do
    visit dashboard_url
    expect(page).to have_text(assessment.name)

    click_link(assessment.name)
    expect(page).to have_text(question_text_en)

    click_button('dropdownMenuLang')
    click_link('Arabic')
    expect(page).to have_text(question_text_ar)

    visit dashboard_url
    expect(page).to have_text(assessment.name)

    click_link(assessment.name)
    expect(page).to have_text(question_text_ar)
  end
end
