# Compatibility shim for running this GitHub Pages/Jekyll stack locally on
# modern Ruby versions where tainted?/untaint were removed.
#
# GitHub Pages itself uses its own runtime, so this is mainly to keep local
# `bundle exec jekyll serve` working on Ruby 3.4/4.x.
class Object
  unless method_defined?(:tainted?)
    def tainted?
      false
    end
  end

  unless method_defined?(:untaint)
    def untaint
      self
    end
  end
end
