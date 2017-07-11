module Copyable
  extend ActiveSupport::Concern

  def gen_uniq_name(attr = :name)
    return unless has_attribute?(attr)
    number = self[attr].scan(/\((\d+)\)$/).flatten.join('').to_i
    if number.zero?
      self[attr] = "#{name} (1)"
    else
      self[attr].gsub!(/\((\d+)\)$/, "(#{number + 1})")
    end
  end

  def clone(generate_uniq_name = true)
    @cloned_item = dup
    @cloned_item.gen_uniq_name if generate_uniq_name
    @cloned_item
  end
end
