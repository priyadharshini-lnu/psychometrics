#
# Abstract Form

# use case:
# 1. Implement AbstractForm (for example: MyForm)
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
end
