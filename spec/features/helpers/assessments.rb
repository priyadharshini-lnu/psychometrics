module Assessments
  def toggle_assessment(assessment, enable = true)
    visit '/administration/assessments'
    find("#assessment_#{assessment.id} .toggle-status").click
    message = 'Enable'
    message = 'Disable' unless enable
    expect(page).to have_content message
    find(:button, text: 'Yes').click
    wait_for_ajax
  end

  def copy_assessment(assessment)
    visit '/administration/assessments'
    find("#assessment_#{assessment.id} .copy").click
    wait_for_ajax
  end

  def preview_assessment(assessment)
    visit '/administration/assessments'
    first("#assessment_#{assessment.id} td", text: assessment.decorate.created_at).click
    click_on t('administration.assessments.sidebar.preview')
  end
end
