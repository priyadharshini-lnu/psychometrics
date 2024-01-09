# frozen_string_literal: true

class LuaEvaluator
  def self.eval(code, lua)
    lua.eval(%(
      arg=nil
      debug.debug=nil
      debug.getfenv=getfenv
      debug.getregistry=nil
      dofile=nil
      io={write=io.write}
      loadfile=nil
      os = {time = os.time}
      package.loaded.io=io
      package.loaded.package=nil
      package=nil
      require=nil
    ))
    lua.eval(code)
  end
end
