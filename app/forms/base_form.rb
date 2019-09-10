# frozen_string_literal: true

#
# Base Form
#
# use case:
# 1. Implement BaseForm (for example: MyForm)
# 2. Use in the controller:
#
# data = MyForm.new(file: 'my_file')
# if data.valid?
#   do success login
# else
#   do error login
#
class BaseForm
  include ActiveModel::Validations
  include ActiveModel::Conversion
  include ActiveModel::Model
  extend ActiveModel::Naming
  extend ActiveModel::Translation

  class << self
    def i18n_scope
      :activerecord
    end
  end
end
