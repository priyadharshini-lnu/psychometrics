module TaskHelper
  def render_alert_by_priority(priority)
    alert_class = 'alert-danger' if priority == 'high'
    alert_class = 'alert-warning' if priority == 'medium'
    alert_class = 'alert-info' if priority == 'low'
    content_tag(:div, content_tag(:strong, t(".#{priority}")), class: "alert #{alert_class}")
  end
end
