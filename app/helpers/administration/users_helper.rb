module Administration::UsersHelper
  def user_status active
    content_tag(:i, '', class: 'fa fa-check') if active
  end
end
