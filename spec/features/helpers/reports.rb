module Reports
  def create_report(opts = {})
    visit '/administration/reports'
    find('.panel-heading .create').click
    fill_in 'resource_name', with: opts[:name]
    select opts[:assessment_name], from: 'resource_assessment_id', visible: false
    select opts[:report_family_name], from: 'resource_report_family_ids', visible: false
    click_on 'Create'
  end

  def enable_report(report)
    visit '/administration/reports'
    find("#report_#{report.id} .toggle-status").click
    find(:button, text: 'Yes').click
    wait_for_ajax
  end

  def disable_report(report)
    visit '/administration/reports'
    find("#report_#{report.id} .toggle-status").click
    find(:button, text: 'Yes').click
    wait_for_ajax
  end

  def copy_report(report)
    visit '/administration/reports'
    find("#report_#{report.id} .copy").click
  end

  def click_report(report)
    first("#report_#{report.id} td", text: report.decorate.created_at).click
  end
end
