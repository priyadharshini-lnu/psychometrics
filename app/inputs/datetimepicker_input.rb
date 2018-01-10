class DatetimepickerInput < SimpleForm::Inputs::Base
  FORMAT_SCOPE = 'time.formats'.freeze

  def input(_wrapper_options)
    input_html_options[:class] = 'form-control'
    template.content_tag(:div, class: 'input-group', data: { behavior: 'datetimepicker' }) do
      template.concat(
        @builder.text_field(attribute_name, date_picker_options.deep_merge(input_html_options))
      )
      template.concat(
        template.content_tag(:span, class: 'input-group-addon') do
          template.content_tag(:span, nil, class: 'glyphicon glyphicon-calendar')
        end
      )
    end
  end


  private

  def server_format
    options.fetch(:server_format, :datetimepicker_server)
  end

  def client_format
    options.fetch(:client_format, :datetimepicker_client)
  end


  def date_picker_options
    value = fetch_value

    result = {
      value: value.blank? ? nil : I18n.l(value, format: server_format),
      data: {
        format: I18n.t(client_format, scope: FORMAT_SCOPE), sidebyside: options[:sidebyside],
      }
    }
    result.tap { |r| r[:data][:min_date] = options[:min_date].to_s if options[:min_date].present? }
  end

  def fetch_value
    value = object ? object.public_send(attribute_name) : nil
    value ||= DateTime.current if options[:initialize_time_now]
    value
  end
end
