module Administration
  module UsersHelper
    def user_status(active)
      return content_tag(:i, '', class: 'fa fa-check') if active
      content_tag(:i, '', class: 'fa fa-times')
    end
  end
end
