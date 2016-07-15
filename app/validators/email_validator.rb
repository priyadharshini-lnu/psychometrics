class EmailValidator < ActiveModel::Validator
  def validate(record)
    options[:fields].each do |field|
      next if options[:allow_nil] && !record.send(field)
      unless record.send(field) =~ /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i
        record.errors[field] << I18n.t('errors.messages.is_not_correct')
      end
    end
  end
end
