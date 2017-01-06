module Copyable
  extend ActiveSupport::Concern

  def gen_uniq_name
    while self.class.exists?(name: name)
      number = name.scan(/\((\d+)\)$/).flatten.join('').to_i
      if number.zero?
        self.name = "#{name} (1)"
      else
        name.gsub!(/\((\d+)\)$/, "(#{number + 1})")
      end
    end
  end

  def clone(generate_uniq_name = true)
    @cloned_item = dup
    @cloned_item.gen_uniq_name if generate_uniq_name
    @cloned_item
  end
end
